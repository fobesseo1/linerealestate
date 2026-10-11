$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$workspace = Split-Path -Parent $PSScriptRoot
$form = New-Object System.Windows.Forms.Form
$form.Text = '선부동산 관리자 비밀번호 설정'
$form.Size = New-Object System.Drawing.Size(510, 415)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.TopMost = $true
$form.Font = New-Object System.Drawing.Font('맑은 고딕', 10)
$intro = New-Object System.Windows.Forms.Label
$intro.Text = "두 관리자 계정에 같은 비밀번호를 설정합니다.`nysyh1730@naver.com / hjdh59@gmail.com`n메일 인증 없이 이메일·비밀번호로 로그인합니다."
$intro.SetBounds(25,20,455,75)
$form.Controls.Add($intro)
$label1 = New-Object System.Windows.Forms.Label
$label1.Text = '새 비밀번호 (8자 이상)'
$label1.SetBounds(25,102,450,25)
$form.Controls.Add($label1)
$password = New-Object System.Windows.Forms.TextBox
$password.UseSystemPasswordChar = $true
$password.SetBounds(25,130,445,30)
$form.Controls.Add($password)
$label2 = New-Object System.Windows.Forms.Label
$label2.Text = '새 비밀번호 확인'
$label2.SetBounds(25,170,450,25)
$form.Controls.Add($label2)
$confirmation = New-Object System.Windows.Forms.TextBox
$confirmation.UseSystemPasswordChar = $true
$confirmation.SetBounds(25,198,445,30)
$form.Controls.Add($confirmation)
$note = New-Object System.Windows.Forms.Label
$note.Text = "같은 이메일의 경매 사이트 비밀번호도 함께 변경됩니다.`n입력한 비밀번호는 채팅·파일·Git에 저장하지 않습니다."
$note.SetBounds(25,242,450,45)
$form.Controls.Add($note)
$status = New-Object System.Windows.Forms.Label
$status.SetBounds(25,295,450,30)
$form.Controls.Add($status)
$save = New-Object System.Windows.Forms.Button
$save.Text = '두 계정 비밀번호 설정'
$save.SetBounds(25,328,445,35)
$form.Controls.Add($save)
$form.AcceptButton = $save
$save.Add_Click({
 if($password.Text.Length -lt 8){$status.Text='비밀번호를 8자 이상 입력해 주세요.';return}
 if($password.Text -cne $confirmation.Text){$status.Text='두 비밀번호가 다릅니다.';return}
 $save.Enabled=$false
 $status.Text='설정하고 로그인 가능 여부를 확인하고 있습니다…'
 [System.Windows.Forms.Application]::DoEvents()
 try{
  $start = New-Object System.Diagnostics.ProcessStartInfo
  $start.FileName = (Get-Command node.exe).Source
  $start.Arguments = '"' + (Join-Path $PSScriptRoot 'set-admin-password.mjs') + '"'
  $start.WorkingDirectory=$workspace
  $start.UseShellExecute=$false
  $start.CreateNoWindow=$true
  $start.RedirectStandardInput=$true
  $start.RedirectStandardOutput=$true
  $start.RedirectStandardError=$true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo=$start
  [void]$process.Start()
  $process.StandardInput.Write(({password=$password.Text}|ConvertTo-Json -Compress))
  $process.StandardInput.Close()
  $password.Clear();$confirmation.Clear()
  $output=$process.StandardOutput.ReadToEnd()
  [void]$process.StandardError.ReadToEnd()
  $process.WaitForExit()
  $result=$output|ConvertFrom-Json
  if(!$result.success){throw 'setup_failed'}
  $status.Text='완료! 두 계정 모두 비밀번호 로그인 확인했습니다.'
  $save.Text='관리자 페이지 열기'
  $save.Enabled=$true
  [System.Windows.Forms.MessageBox]::Show('설정 완료. 두 이메일 중 하나와 방금 정한 비밀번호로 로그인하세요.','선부동산')|Out-Null
  Start-Process 'https://fobesseo1.github.io/linerealestate/admin/'
  $form.Close()
 }catch{
  $status.Text='설정하지 못했습니다. 다른 비밀번호로 다시 시도해 주세요.'
  $save.Enabled=$true
 }
})
$form.Add_Shown({$password.Focus()})
[void]$form.ShowDialog()
