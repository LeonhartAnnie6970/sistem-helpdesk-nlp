@echo off
echo ========================================
echo NLP Model Retraining Script
echo ========================================
echo.

:: Delete old model files
echo [1/3] Deleting old model files...
if exist model.pkl del model.pkl
if exist vectorizer.pkl del vectorizer.pkl
echo Old models deleted.
echo.

:: Activate virtual environment
echo [2/3] Activating virtual environment...
call .venv\Scripts\activate.bat
echo.

:: Train new model
echo [3/3] Training new model with updated divisions...
python train_model.py
echo.

if exist model.pkl (
    echo ========================================
    echo SUCCESS! Model trained successfully.
    echo ========================================
    echo.
    echo New files created:
    echo - model.pkl
    echo - vectorizer.pkl
    echo.
    echo Next step: Restart NLP API server
    echo Command: python app_refactor.py
) else (
    echo ========================================
    echo ERROR! Model training failed.
    echo ========================================
    echo Please check the error messages above.
)

echo.
pause
