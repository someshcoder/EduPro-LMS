$files = Get-ChildItem -Path "c:\Users\user\Documents\LMS\client\src\pages\admin\*.jsx", "c:\Users\user\Documents\LMS\client\src\pages\user\*.jsx" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Fix remaining dark patterns - glass dark borders
    $content = $content -replace 'border border-\[#E2E8F0\] overflow-hidden', 'border border-[#E2E8F0] shadow-xs overflow-hidden'
    
    # Fix indigo dark theme colors -> cyan/purple light theme
    $content = $content -replace 'text-indigo-400', 'text-[#06B6D4]'
    $content = $content -replace 'text-indigo-300', 'text-[#06B6D4]'
    $content = $content -replace 'bg-indigo-500/10', 'bg-cyan-50'
    $content = $content -replace 'bg-indigo-500/20', 'bg-cyan-50'
    $content = $content -replace 'border-indigo-500/20', 'border-cyan-200'
    $content = $content -replace 'border-indigo-500/30', 'border-cyan-200'
    $content = $content -replace 'focus:border-indigo-500', 'focus:border-[#06B6D4]'
    $content = $content -replace 'text-violet-400', 'text-[#8B5CF6]'
    $content = $content -replace 'bg-violet-400/10', 'bg-violet-50'
    $content = $content -replace 'border-violet-500/20', 'border-violet-200'
    $content = $content -replace 'from-slate-900 via-indigo-950/20 to-slate-900', 'from-white to-[#F8FAFC]'
    $content = $content -replace 'from-slate-900 to-indigo-950/20', 'from-white to-cyan-50/30'
    $content = $content -replace 'from-slate-900 to-purple-950/20', 'from-white to-violet-50/30'
    $content = $content -replace 'from-slate-900 to-blue-950/20', 'from-white to-blue-50/30'
    $content = $content -replace 'from-slate-900 via-emerald-950/20 to-slate-900', 'from-white to-emerald-50/30'
    
    # Fix from-indigo-900 dark bg gradient banners
    $content = $content -replace 'from-indigo-900/40 via-purple-900/30 to-slate-900', 'from-cyan-50 via-violet-50/50 to-[#F8FAFC]'
    
    # Fix dark glass borders used in panels
    $content = $content -replace 'glass rounded-2xl p-6 border border-\[#E2E8F0\]', 'bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs'
    $content = $content -replace 'glass rounded-xl border border-\[#E2E8F0\]', 'bg-white rounded-xl border border-[#E2E8F0] shadow-xs'
    $content = $content -replace 'glass rounded-2xl border border-\[#E2E8F0\]', 'bg-white rounded-2xl border border-[#E2E8F0] shadow-xs'
    
    # Fix dark card color overrides that remain
    $content = $content -replace 'bg-gradient-to-br from-\[#F8FAFC\] to-indigo-950/20', 'bg-white'
    
    # Remaining text-[#1E293B] that should stay but fix any from-indigo-500 
    $content = $content -replace 'from-indigo-500 to-violet-500', 'from-[#06B6D4] to-[#8B5CF6]'
    $content = $content -replace 'from-indigo-600 to-violet-600', 'from-[#06B6D4] to-[#8B5CF6]'
    $content = $content -replace 'from-amber-500 to-orange-500', 'from-[#FDBA74] to-[#FB7185]'
    
    # bg-white/5 -> light glass
    $content = $content -replace 'bg-white/5', 'bg-[#F8FAFC]'
    $content = $content -replace 'border-white/10', 'border-[#E2E8F0]'
    
    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}
Write-Host "Done!"
