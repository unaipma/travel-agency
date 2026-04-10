<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorController extends Controller
{
    public function generateSecret(Request $request)
    {
        $user = auth()->user();
        $google2fa = new Google2FA();

        if (!$user->two_factor_secret) {
            $user->two_factor_secret = $google2fa->generateSecretKey();
            $user->save();
        }
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            'Triptoyou',
            $user->email,
            $user->two_factor_secret
        );

        $renderer = new ImageRenderer(new RendererStyle(200), new SvgImageBackEnd());
        $writer = new Writer($renderer);
        $svg = $writer->writeString($qrCodeUrl);
        $base64 = base64_encode($svg);

        return response()->json([
            'qr_image' => 'data:image/svg+xml;base64,' . $base64,
            'secret' => $user->two_factor_secret
        ]);
    }

    public function enable(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $user = auth()->user();
        $google2fa = new Google2FA();

        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if ($valid) {
            $user->two_factor_enabled = true;
            $user->save();
            return response()->json(['message' => '2FA activado correctamente.']);
        }

        return response()->json(['error' => 'Código incorrecto.'], 400);
    }

    public function disable(Request $request)
    {
        $user = auth()->user();
        $user->two_factor_enabled = false;
        $user->two_factor_secret = null;
        $user->save();

        return response()->json(['message' => '2FA desactivado.']);
    }
}