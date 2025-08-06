@echo off
echo Starting production build...

echo Cleaning previous build...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo Installing dependencies...
npm install

echo Building application...
npm run build

echo Build completed!
pause