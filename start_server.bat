@echo off
echo =======================================================
echo    Starting FitPulse Backend Server...
echo =======================================================
echo.

echo Compiling Java files...
if not exist "build\classes" mkdir "build\classes"
javac -encoding UTF-8 -cp "lib/*;bin;build/classes" -d build/classes src/model/*.java src/dao/*.java src/service/*.java src/controller/*.java src/filter/*.java src/util/*.java

if %ERRORLEVEL% equ 0 (
    echo Compilation Succeeded! 
    echo.
    echo Starting the Server on Port 8080...
    echo (Do not close this black window while using the website)
    echo.
    
    REM Open the browser automatically
    start http://localhost:8080/
    
    REM Run the Java AppServer
    java -cp "lib/*;build/classes" util.AppServer
) else (
    echo.
    echo Compilation failed! Please check the errors above.
    pause
)
