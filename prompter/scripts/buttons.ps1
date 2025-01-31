param (
    [string]$items,
    [string]$title = "Select an Option",
    [bool]$sound = 1
)

Add-Type -AssemblyName PresentationFramework

# Parse JSON input
$buttons = ConvertFrom-Json -InputObject $items

# Detect System Theme (Dark or Light Mode)
$themeKey = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
$themeValue = Get-ItemPropertyValue -Path $themeKey -Name AppsUseLightTheme -ErrorAction SilentlyContinue
$darkMode = if ($themeValue -eq 0) { $true } else { $false }

# Colors based on Theme
$bgColor = '#FFFFFF'
$txtColor =  "#333333"

# Create Window (Always on Main Monitor)
$window = New-Object System.Windows.Window
$window.Title = $title
$window.Width = 320
$window.Height = 100 + ($buttons.Count * 50) # Adjust height based on button count
$window.WindowStartupLocation = "CenterOwner"
$window.Background = $bgColor
$window.Topmost = $true
$window.AllowsTransparency = $true
$window.WindowStyle = "None"
$window.ResizeMode = "NoResize"

$global:window = $window

# Force Window to Appear on Main Monitor
$screen = [System.Windows.SystemParameters]::PrimaryScreenWidth
$screenHeight = [System.Windows.SystemParameters]::PrimaryScreenHeight
$window.Left = ($screen - $window.Width) / 2
$window.Top = ($screenHeight - $window.Height) / 2

# Create StackPanel (Container)
$stackPanel = New-Object System.Windows.Controls.StackPanel
$stackPanel.Orientation = "Vertical"
$stackPanel.HorizontalAlignment = "Center"
$stackPanel.VerticalAlignment = "Center"
$stackPanel.Margin = "15"

$textBlock = New-Object System.Windows.Controls.TextBlock 
$textBlock.Text = $title 
$textBlock.FontSize = 20 
$textBlock.FontWeight = "Bold"
$textBlock.Foreground = $txtColor 
$textBlock.HorizontalAlignment = "Center" 
$textBlock.Margin = "10"

$stackPanel.AddChild($textBlock)

# Button Styles
function Create-Button($name, $value, $color) {
    $button = New-Object System.Windows.Controls.Button
    $button.Content = $name
    $button.Margin = "5"
    $button.Width = 240
    $button.Height = 45
    $button.FontSize = 16
    $button.FontWeight = "Medium"
    $button.Background = "#0078D4"
    $button.Foreground =  "#FFFFFF"
    $button.BorderThickness = 0
    $button.HorizontalAlignment = "Center"
    $button.Cursor = "Hand"
    $button.Add_Click({
        Write-Host $value

        $global:window.Close()
    }.GetNewClosure())

    return $button
}

# Add buttons dynamically
foreach ($btn in $buttons) {
    $stackPanel.AddChild((Create-Button $btn.name $btn.value $btn.color))
}

# Apply Rounded Corners via Border
$border = New-Object System.Windows.Controls.Border
$border.CornerRadius = "12"
$border.Background = $bgColor
$border.Child = $stackPanel
$border.Padding = "10"
$window.Content = $border

# Play Sound  repeatedly
if ($sound) {
    $soundPath = "$env:windir\Media\Alarm09.wav"
    $soundPlayer = New-Object System.Media.SoundPlayer 
    $soundPlayer.SoundLocation = $soundPath 
    $soundPlayer.PlayLooping()
}

# Force Response Before Closing
$window.ShowDialog() | Out-Null
