<#
.SYNOPSIS
  Decodes iPhone HEIC photos to lossless PNG so build-photos.mjs can read them.

.DESCRIPTION
  sharp's bundled libheif fails on the HEIC variant Apple writes ("bad seek",
  the item index runs past EOF), while Windows' own HEIF codec reads the same
  files without complaint. So we decode with WIC here and let the normal
  pipeline take over from the PNGs.

  Output is lossless, so quality is decided in one place: the JPEG settings in
  build-photos.mjs.

.EXAMPLE
  pwsh -File scripts/heic-to-png.ps1
  pwsh -File scripts/heic-to-png.ps1 -Source "D:/photos" -Destination "D:/photos-png"
#>
param(
  [string]$Source = "C:/MSEMS Event/keep/New folder",
  [string]$Destination = "C:/MSEMS Event/keep/converted",
  [switch]$Force
)

Add-Type -AssemblyName PresentationCore

if (-not (Test-Path $Source)) { Write-Error "Source folder not found: $Source"; exit 1 }
if (-not (Test-Path $Destination)) { New-Item -ItemType Directory -Path $Destination | Out-Null }

$files = Get-ChildItem -Path $Source -Filter *.heic
if ($files.Count -eq 0) { Write-Error "No .heic files in $Source"; exit 1 }

$converted = 0; $skipped = 0; $failed = @()

foreach ($file in $files) {
  $target = Join-Path $Destination ($file.BaseName + ".png")
  $exists = Test-Path $target

  try {
    $stream = [System.IO.File]::OpenRead($file.FullName)
    # OnLoad so the stream can close right after; WIC applies EXIF orientation.
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $stream, 'None', 'OnLoad')

    # WIC writes no EXIF into the PNG, so the shot time has to ride on the file
    # timestamp, which build-photos.mjs falls back to when EXIF is absent. The
    # HEIC's own timestamp is when it was copied off the phone, hours after the
    # event, so read EXIF DateTimeOriginal (tag 36867) instead.
    $shot = $file.LastWriteTime
    try {
      $raw = $decoder.Frames[0].Metadata.GetQuery('/ifd/exif/{ushort=36867}')
      if ($raw) {
        $shot = [datetime]::ParseExact($raw, 'yyyy:MM:dd HH:mm:ss', $null)
      }
    } catch { }

    if ($exists -and -not $Force) {
      $skipped++
    } else {
      $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
      $encoder.Frames.Add($decoder.Frames[0])
      $out = [System.IO.File]::Create($target)
      $encoder.Save($out)
      $out.Close()
      $converted++
    }
    $stream.Close()
    # Re-stamped every run, so folders converted before this fix get fixed too.
    (Get-Item $target).LastWriteTime = $shot
  } catch {
    $failed += "$($file.Name): $($_.Exception.Message)"
  }
}

Write-Output "Done. $converted converted, $skipped already present, $($failed.Count) failed."
if ($failed.Count -gt 0) { $failed | ForEach-Object { Write-Output "  FAILED $_" }; exit 1 }
