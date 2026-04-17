import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin';

interface ImageItem {
  file?: File;
  preview: string;
  isCover: boolean;
  existingId?: number;
}

@Component({
  selector: 'app-trip-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trip-form.html',
})
export class TripForm implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal<boolean>(false);
  tripId = signal<string | null>(null);
  loading = signal<boolean>(false);

  images = signal<ImageItem[]>([]);

  tripForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    destination: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    max_people: [10, [Validators.required, Validators.min(1)]],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.tripId.set(id);
      this.loadTripData(id);
    }
  }

  loadTripData(id: string) {
    this.adminService.getTrip(id).subscribe({
      next: (response) => {
        const trip = response.data || response;
        this.tripForm.patchValue({
          title: trip.title,
          destination: trip.destination,
          description: trip.description,
          price: trip.price,
          max_people: trip.max_people,
          start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
          end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
        });

        if (trip.images && trip.images.length > 0) {
          const loadedImages = trip.images.map((img: any) => ({
            preview: img.image_path,
            isCover: img.is_cover === 1 || img.is_cover === true,
            existingId: img.id,
          }));

          if (!loadedImages.some((img: ImageItem) => img.isCover) && loadedImages.length > 0) {
            loadedImages[0].isCover = true;
          }
          this.images.set(loadedImages);
        }
      },
      error: (err) => console.error('Error al cargar el viaje', err),
    });
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const currentImages = [...this.images()];
    let hasCover = currentImages.some((img) => img.isCover);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentImages.push({
          file: file,
          preview: e.target?.result as string,
          isCover: !hasCover,
        });
        hasCover = true;
        this.images.set(currentImages);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  setAsCover(index: number) {
    const updated = this.images().map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    this.images.set(updated);
  }

  removeImage(index: number) {
    const current = [...this.images()];
    const wasCover = current[index].isCover;
    current.splice(index, 1);

    if (wasCover && current.length > 0) {
      current[0].isCover = true;
    }

    this.images.set(current);
  }

  onSubmit() {
    if (this.tripForm.invalid) return;

    this.loading.set(true);
    const formData = new FormData();
    const formValues = this.tripForm.getRawValue();

    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    let newFilesCount = 0;
    this.images().forEach((img) => {
      if (img.file) {
        formData.append('images[]', img.file);
        if (img.isCover) {
          formData.append('cover_index', newFilesCount.toString());
        }
        newFilesCount++;
      }
    });

    if (this.isEditMode() && this.tripId()) {
      this.adminService.updateTrip(this.tripId()!, formData).subscribe({
        next: () => this.router.navigate(['/admin/trips']),
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
    } else {
      this.adminService.createTrip(formData).subscribe({
        next: () => this.router.navigate(['/admin/trips']),
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
    }
  }
}
