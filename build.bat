@echo off

REM Elimina el archivo extension.zip si existe
if exist extension.zip del /f /q extension.zip

REM Ejecuta el comando "npm run build"
npm run build

REM Entra en la carpeta "extension"
pushd extension

REM Comprime la carpeta en extension.zip, excluyendo los archivos .DS_Store
powershell -Command "Compress-Archive -Path * -DestinationPath ../extension.zip -Force

REM Vuelve al directorio original
popd
