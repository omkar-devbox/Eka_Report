; setup.iss
; Inno Setup compiler script for Eka Report Studio

[Setup]
AppName=Eka Report Studio
AppVersion=1.0.0
AppPublisher=Eka Studio
DefaultDirName={autopf}\Eka Report Studio
DefaultGroupName=Eka Report Studio
UninstallDisplayIcon={app}\EkaReportStudio.exe
SetupIconFile=eka_logo.ico
WizardImageFile=wizard_image.bmp
WizardSmallImageFile=wizard_small.bmp
WizardImageStretch=no
Compression=lzma2
SolidCompression=yes
OutputDir=dist
OutputBaseFilename=EkaReportStudioSetup
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=yes
DisableFinishedPage=no
PrivilegesRequired=lowest

[Files]
Source: "dist\EkaReportStudio\*"; DestDir: "{app}"; Excludes: ".env"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "dist\EkaReportStudio\.env"; DestDir: "{app}"; Flags: onlyifdoesntexist
Source: "eka_logo.ico"; DestDir: "{app}"; Flags: ignoreversion


[Icons]
Name: "{group}\Eka Report Studio"; Filename: "{app}\EkaReportStudio.exe"; IconFilename: "{app}\eka_logo.ico"
Name: "{autodesktop}\Eka Report Studio"; Filename: "{app}\EkaReportStudio.exe"; IconFilename: "{app}\eka_logo.ico"; Tasks: desktopicon
Name: "{userstartup}\Eka Report Studio"; Filename: "{app}\EkaReportStudio.exe"; IconFilename: "{app}\eka_logo.ico"; Tasks: startupicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional shortcuts:"
Name: "startupicon"; Description: "Launch Eka Report Studio automatically when Windows starts"; GroupDescription: "Additional shortcuts:"; Flags: unchecked


[Run]
Filename: "{app}\EkaReportStudio.exe"; Description: "Launch Eka Report Studio"; Flags: nowait postinstall skipifsilent

