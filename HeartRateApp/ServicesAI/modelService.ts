import * as tf from '@tensorflow/tfjs';
import loadModel from './loadModel';

class ModelService {
    private static instance: ModelService;
    private _model: any = null;
    private _isLoading: boolean = false;
    private _error: string | null = null;
    private _listeners: Function[] = [];
    private _navigation: any = null;

    private constructor() {}

    public static getInstance(): ModelService {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService();
        }
        return ModelService.instance;
    }

    public setNavigation(navigation: any): void {
        this._navigation = navigation;
    }

    public async initModel(): Promise<void> {
        if (this._model || this._isLoading) return;

        try {
            this._isLoading = true;
            this.notifyListeners();

            await tf.setBackend('cpu');
            await tf.ready();
            this._model = await loadModel();
            console.log('✅ Model loaded successfully');

            this._isLoading = false;
            this._error = null;
            this.notifyListeners();
        } catch (err) {
            console.log('🚨 Không thể tải mô hình:', err);
            this._isLoading = false;
            this._error = err instanceof Error ? err.message : 'Unknown error';
            this.notifyListeners();
        }
    }

    public getModel(): any {
        return this._model;
    }

    public isLoading(): boolean {
        return this._isLoading;
    }

    public getError(): string | null {
        return this._error;
    }

    public subscribe(listener: Function): () => void {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners(): void {
        this._listeners.forEach((listener) => listener());
    }

    // Phương thức an toàn để điều hướng
    public navigateBack(): void {
        if (this._navigation && typeof this._navigation.back === 'function') {
            this._navigation.back();
        } else {
            console.warn('Navigation is not available or cannot go back');
        }
    }
}

export default ModelService.getInstance();
