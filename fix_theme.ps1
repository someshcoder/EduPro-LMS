$files = Get-ChildItem -Path "c:\Users\user\Documents\LMS\client\src\pages\admin\*.jsx", "c:\Users\user\Documents\LMS\client\src\pages\user\*.jsx" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    $content = $content -replace 'text-white\b', 'text-[#1E293B]'
    $content = $content -replace 'text-slate-400', 'text-[#64748B]'
    $content = $content -replace 'text-slate-300', 'text-[#64748B]'
    $content = $content -replace 'text-slate-500', 'text-[#94A3B8]'
    $content = $content -replace 'text-slate-600', 'text-[#64748B]'
    $content = $content -replace 'bg-slate-800/70', 'bg-white'
    $content = $content -replace 'bg-slate-800/50', 'bg-[#F8FAFC]'
    $content = $content -replace 'bg-slate-800/40', 'bg-[#F8FAFC]'
    $content = $content -replace 'bg-slate-800\b', 'bg-[#F1F5F9]'
    $content = $content -replace 'bg-slate-700\b', 'bg-[#E2E8F0]'
    $content = $content -replace 'bg-slate-900\b', 'bg-white'
    $content = $content -replace 'bg-slate-950/80', 'bg-[#F1F5F9]'
    $content = $content -replace 'bg-slate-950\b', 'bg-[#F8FAFC]'
    $content = $content -replace 'border-slate-800\b', 'border-[#E2E8F0]'
    $content = $content -replace 'border-slate-700/50', 'border-[#E2E8F0]'
    $content = $content -replace 'border-slate-700\b', 'border-[#E2E8F0]'
    $content = $content -replace 'hover:bg-slate-800\b', 'hover:bg-[#F1F5F9]'
    $content = $content -replace 'hover:bg-slate-700\b', 'hover:bg-[#E2E8F0]'
    $content = $content -replace 'hover:text-white\b', 'hover:text-[#1E293B]'
    $content = $content -replace 'divide-slate-800\b', 'divide-[#F1F5F9]'
    $content = $content -replace 'divide-slate-700\b', 'divide-[#E2E8F0]'
    $content = $content -replace 'placeholder-slate-500', 'placeholder-slate-400'
    $content = $content -replace 'min-h-screen bg-slate-950', 'min-h-screen bg-[#F8FAFC]'
    
    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}
Write-Host "Done!"
