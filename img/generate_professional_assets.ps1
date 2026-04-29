Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function Backup-IfNeeded {
    param(
        [string]$Path
    )

    $dir = Split-Path -Path $Path -Parent
    $name = [System.IO.Path]::GetFileNameWithoutExtension($Path)
    $ext = [System.IO.Path]::GetExtension($Path)
    $backup = Join-Path $dir ($name + '-orig' + $ext)
    if (-not (Test-Path -LiteralPath $backup)) {
        Copy-Item -LiteralPath $Path -Destination $backup
    }
}

function New-TransparentBitmap {
    param(
        [int]$Width,
        [int]$Height
    )

    $bmp = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.Clear([System.Drawing.Color]::Transparent)
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gfx.Dispose()
    return $bmp
}

function Get-AlphaBounds {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [int]$AlphaThreshold = 16
    )

    $minX = $Bitmap.Width
    $minY = $Bitmap.Height
    $maxX = -1
    $maxY = -1

    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            $px = $Bitmap.GetPixel($x, $y)
            if ($px.A -gt $AlphaThreshold) {
                if ($x -lt $minX) { $minX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($maxX -lt 0) {
        return [System.Drawing.Rectangle]::FromLTRB(0, 0, $Bitmap.Width, $Bitmap.Height)
    }

    return [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
}

function Remove-SmallIslands {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [int]$AlphaThreshold = 18,
        [int]$MinIslandPixels = 120
    )

    $visited = New-Object 'bool[,]' $Bitmap.Width, $Bitmap.Height
    $dirs = @(
        @(-1, 0), @(1, 0), @(0, -1), @(0, 1),
        @(-1, -1), @(-1, 1), @(1, -1), @(1, 1)
    )

    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            if ($visited[$x, $y]) { continue }
            $visited[$x, $y] = $true
            $start = $Bitmap.GetPixel($x, $y)
            if ($start.A -le $AlphaThreshold) { continue }

            $queue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'
            $points = New-Object 'System.Collections.Generic.List[System.Drawing.Point]'
            $queue.Enqueue([System.Drawing.Point]::new($x, $y))
            $points.Add([System.Drawing.Point]::new($x, $y))

            while ($queue.Count -gt 0) {
                $point = $queue.Dequeue()
                foreach ($dir in $dirs) {
                    $nx = $point.X + $dir[0]
                    $ny = $point.Y + $dir[1]
                    if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $Bitmap.Width -or $ny -ge $Bitmap.Height) { continue }
                    if ($visited[$nx, $ny]) { continue }
                    $visited[$nx, $ny] = $true
                    $neighbor = $Bitmap.GetPixel($nx, $ny)
                    if ($neighbor.A -gt $AlphaThreshold) {
                        $nextPoint = [System.Drawing.Point]::new($nx, $ny)
                        $queue.Enqueue($nextPoint)
                        $points.Add($nextPoint)
                    }
                }
            }

            if ($points.Count -lt $MinIslandPixels) {
                foreach ($pt in $points) {
                    $Bitmap.SetPixel($pt.X, $pt.Y, [System.Drawing.Color]::Transparent)
                }
            }
        }
    }
}

function Clone-Rectangle {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [System.Drawing.Rectangle]$Rect
    )

    return $Bitmap.Clone($Rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Trim-Bitmap {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [int]$Padding = 0,
        [int]$AlphaThreshold = 16
    )

    $bounds = Get-AlphaBounds -Bitmap $Bitmap -AlphaThreshold $AlphaThreshold
    $left = [Math]::Max(0, $bounds.Left - $Padding)
    $top = [Math]::Max(0, $bounds.Top - $Padding)
    $right = [Math]::Min($Bitmap.Width, $bounds.Right + $Padding)
    $bottom = [Math]::Min($Bitmap.Height, $bounds.Bottom + $Padding)
    $rect = [System.Drawing.Rectangle]::FromLTRB($left, $top, $right, $bottom)
    return Clone-Rectangle -Bitmap $Bitmap -Rect $rect
}

function Place-OnCanvas {
    param(
        [System.Drawing.Bitmap]$Source,
        [int]$Width,
        [int]$Height,
        [double]$Scale = 0.84,
        [int]$OffsetX = 0,
        [int]$OffsetY = 0
    )

    $canvas = New-TransparentBitmap -Width $Width -Height $Height
    $gfx = [System.Drawing.Graphics]::FromImage($canvas)
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $scaleX = ($Width * $Scale) / $Source.Width
    $scaleY = ($Height * $Scale) / $Source.Height
    $ratio = [Math]::Min($scaleX, $scaleY)
    $drawWidth = [int][Math]::Round($Source.Width * $ratio)
    $drawHeight = [int][Math]::Round($Source.Height * $ratio)
    $x = [int][Math]::Round(($Width - $drawWidth) / 2) + $OffsetX
    $y = [int][Math]::Round(($Height - $drawHeight) / 2) + $OffsetY

    $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(50, 0, 0, 0))
    $shadowY = [Math]::Min($Height - 22, $y + $drawHeight - [int]($Height * 0.06))
    $shadowW = [Math]::Min($Width - 80, [int]($drawWidth * 0.72))
    $shadowH = [Math]::Max(18, [int]($drawHeight * 0.08))
    $shadowX = [int](($Width - $shadowW) / 2) + $OffsetX
    $gfx.FillEllipse($shadowBrush, $shadowX, $shadowY, $shadowW, $shadowH)
    $shadowBrush.Dispose()

    $gfx.DrawImage($Source, [System.Drawing.Rectangle]::new($x, $y, $drawWidth, $drawHeight))
    $gfx.Dispose()
    return $canvas
}

function Save-Png {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Force
    }
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Build-CroquiAsset {
    param(
        [string]$InputPath,
        [string]$OutputPath
    )

    $src = [System.Drawing.Bitmap]::FromFile($InputPath)
    try {
        Remove-SmallIslands -Bitmap $src -MinIslandPixels 80
        $trimmed = Trim-Bitmap -Bitmap $src -Padding 12
        try {
            $canvas = New-TransparentBitmap -Width 1024 -Height 1024
            $gfx = [System.Drawing.Graphics]::FromImage($canvas)
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(110, 255, 255, 255)), 18
            $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
            $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
            $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
            $gfx.DrawLine($pen, 230, 160, 470, 400)
            $gfx.DrawLine($pen, 790, 180, 550, 420)
            $pen.Dispose()

            $accent = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(165, 245, 158, 11)), 14
            $accent.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
            $accent.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
            $gfx.DrawLine($accent, 458, 370, 514, 426)
            $gfx.DrawLine($accent, 514, 370, 458, 426)
            $accent.Dispose()

            $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(46, 0, 0, 0))
            $gfx.FillEllipse($shadowBrush, 210, 690, 610, 92)
            $shadowBrush.Dispose()

            $ratio = [Math]::Min((760.0 / $trimmed.Width), (560.0 / $trimmed.Height))
            $drawW = [int][Math]::Round($trimmed.Width * $ratio)
            $drawH = [int][Math]::Round($trimmed.Height * $ratio)
            $drawX = [int][Math]::Round((1024 - $drawW) / 2)
            $drawY = [int][Math]::Round((1024 - $drawH) / 2) + 40
            $gfx.DrawImage($trimmed, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawW, $drawH))
            $gfx.Dispose()

            Save-Png -Bitmap $canvas -Path $OutputPath
            $canvas.Dispose()
        }
        finally {
            $trimmed.Dispose()
        }
    }
    finally {
        $src.Dispose()
    }
}

function Build-TacografoAsset {
    param(
        [string]$InputPath,
        [string]$OutputPath
    )

    $src = [System.Drawing.Bitmap]::FromFile($InputPath)
    try {
        Remove-SmallIslands -Bitmap $src -MinIslandPixels 40
        $trimmed = Trim-Bitmap -Bitmap $src -Padding 8
        try {
            $canvas = New-TransparentBitmap -Width 768 -Height 768
            $gfx = [System.Drawing.Graphics]::FromImage($canvas)
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
            $gfx.FillEllipse($shadowBrush, 160, 560, 450, 64)
            $shadowBrush.Dispose()

            $ratio = [Math]::Min((530.0 / $trimmed.Width), (530.0 / $trimmed.Height))
            $drawW = [int][Math]::Round($trimmed.Width * $ratio)
            $drawH = [int][Math]::Round($trimmed.Height * $ratio)
            $drawX = [int][Math]::Round((768 - $drawW) / 2)
            $drawY = [int][Math]::Round((768 - $drawH) / 2) - 16
            $gfx.DrawImage($trimmed, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawW, $drawH))
            $gfx.Dispose()

            Save-Png -Bitmap $canvas -Path $OutputPath
            $canvas.Dispose()
        }
        finally {
            $trimmed.Dispose()
        }
    }
    finally {
        $src.Dispose()
    }
}

function Build-RelatoPolicialAsset {
    param(
        [string]$BrandPath,
        [string]$SirenPath,
        [string]$OutputPath
    )

    $brand = [System.Drawing.Bitmap]::FromFile($BrandPath)
    $siren = [System.Drawing.Bitmap]::FromFile($SirenPath)
    try {
        Remove-SmallIslands -Bitmap $brand -MinIslandPixels 80
        Remove-SmallIslands -Bitmap $siren -MinIslandPixels 80
        $brandTrim = Trim-Bitmap -Bitmap $brand -Padding 8
        $sirenTrim = Trim-Bitmap -Bitmap $siren -Padding 4
        try {
            $canvas = New-TransparentBitmap -Width 1024 -Height 1024
            $gfx = [System.Drawing.Graphics]::FromImage($canvas)
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            $backBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(36, 11, 29, 63))
            $gfx.FillEllipse($backBrush, 120, 120, 780, 780)
            $backBrush.Dispose()

            $ratioBrand = [Math]::Min((610.0 / $brandTrim.Width), (720.0 / $brandTrim.Height))
            $brandW = [int][Math]::Round($brandTrim.Width * $ratioBrand)
            $brandH = [int][Math]::Round($brandTrim.Height * $ratioBrand)
            $gfx.DrawImage($brandTrim, [System.Drawing.Rectangle]::new(190, 130, $brandW, $brandH))

            $ratioSiren = [Math]::Min((260.0 / $sirenTrim.Width), (260.0 / $sirenTrim.Height))
            $sirenW = [int][Math]::Round($sirenTrim.Width * $ratioSiren)
            $sirenH = [int][Math]::Round($sirenTrim.Height * $ratioSiren)
            $gfx.DrawImage($sirenTrim, [System.Drawing.Rectangle]::new(635, 120, $sirenW, $sirenH))

            $fontFamily = New-Object System.Drawing.FontFamily('Segoe UI')
            $font = New-Object System.Drawing.Font($fontFamily, 86, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
            $subFont = New-Object System.Drawing.Font($fontFamily, 32, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
            $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(244, 255, 255, 255))
            $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 219, 234, 255))
            $center = New-Object System.Drawing.StringFormat
            $center.Alignment = [System.Drawing.StringAlignment]::Center
            $center.LineAlignment = [System.Drawing.StringAlignment]::Center
            $gfx.DrawString('RP', $font, $whiteBrush, [System.Drawing.RectangleF]::new(170, 720, 684, 120), $center)
            $gfx.DrawString('RELATO POLICIAL', $subFont, $mutedBrush, [System.Drawing.RectangleF]::new(180, 842, 664, 50), $center)

            $font.Dispose()
            $subFont.Dispose()
            $fontFamily.Dispose()
            $whiteBrush.Dispose()
            $mutedBrush.Dispose()
            $center.Dispose()
            $gfx.Dispose()

            Save-Png -Bitmap $canvas -Path $OutputPath
            $canvas.Dispose()
        }
        finally {
            $brandTrim.Dispose()
            $sirenTrim.Dispose()
        }
    }
    finally {
        $brand.Dispose()
        $siren.Dispose()
    }
}

$root = Split-Path -Path $MyInvocation.MyCommand.Path -Parent

$targets = @(
    'Croqui.png',
    'tacofrafo.png',
    'extracted_2.png',
    'extracted_3.png',
    'extracted_5.png',
    'extracted_4.png'
)

foreach ($name in $targets) {
    Backup-IfNeeded -Path (Join-Path $root $name)
}

$standardAssets = @(
    @{ Name = 'extracted_2.png'; Width = 1280; Height = 880; Scale = 0.88; OffsetX = 0; OffsetY = 30; MinIsland = 220 },
    @{ Name = 'extracted_3.png'; Width = 920; Height = 920; Scale = 0.90; OffsetX = 12; OffsetY = 16; MinIsland = 2200 },
    @{ Name = 'extracted_5.png'; Width = 1200; Height = 900; Scale = 0.90; OffsetX = 0; OffsetY = 18; MinIsland = 180; CropTop = 320 }
)

foreach ($asset in $standardAssets) {
    $path = Join-Path $root $asset.Name
    $renderPath = $path + '.render.png'
    $sourcePath = Join-Path $root (([System.IO.Path]::GetFileNameWithoutExtension($asset.Name)) + '-orig.png')
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        $sourcePath = $path
    }
    if (Test-Path -LiteralPath $renderPath) {
        Remove-Item -LiteralPath $renderPath -Force
    }
    $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
    try {
        Remove-SmallIslands -Bitmap $bitmap -MinIslandPixels $asset.MinIsland
        if ($asset.ContainsKey('CropTop')) {
            $cropRect = [System.Drawing.Rectangle]::FromLTRB(0, $asset.CropTop, $bitmap.Width, $bitmap.Height)
            $cropped = Clone-Rectangle -Bitmap $bitmap -Rect $cropRect
        } else {
            $cropped = Clone-Rectangle -Bitmap $bitmap -Rect ([System.Drawing.Rectangle]::FromLTRB(0, 0, $bitmap.Width, $bitmap.Height))
        }
        try {
            $trimmed = Trim-Bitmap -Bitmap $cropped -Padding 12
            try {
                $final = Place-OnCanvas -Source $trimmed -Width $asset.Width -Height $asset.Height -Scale $asset.Scale -OffsetX $asset.OffsetX -OffsetY $asset.OffsetY
                try {
                    Save-Png -Bitmap $final -Path $renderPath
                }
                finally {
                    $final.Dispose()
                }
            }
            finally {
                $trimmed.Dispose()
            }
        }
        finally {
            $cropped.Dispose()
        }
    }
    finally {
        $bitmap.Dispose()
    }

    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Force
    }
    Move-Item -LiteralPath $renderPath -Destination $path
}

Build-CroquiAsset -InputPath (Join-Path $root 'Croqui-orig.png') -OutputPath (Join-Path $root 'Croqui.png')
Build-TacografoAsset -InputPath (Join-Path $root 'tacofrafo-orig.png') -OutputPath (Join-Path $root 'tacofrafo.png')
Build-RelatoPolicialAsset -BrandPath (Join-Path $root 'extracted_1.png') -SirenPath (Join-Path $root 'patrulha.png') -OutputPath (Join-Path $root 'extracted_4.png')
