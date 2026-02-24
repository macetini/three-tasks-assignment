import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrepareFlameCommand } from '../../../../../src/core/mvcs/controller/commands/PrepareFlameCommand';
import { FlameModel } from '../../../../../src/core/mvcs/model/states/FlameModel';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('PrepareFlameCommand', () => {
    let command: PrepareFlameCommand;
    let mockAssetService: any;
    let mockSignalBus: any;
    let mockModelMap: any;
    let mockFlameModel: any;
    let mockRenderer: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        
        mockAssetService = {
            getFlameTexture: vi.fn().mockResolvedValue({ mock: 'flame-texture' })
        };        
        mockSignalBus = { emit: vi.fn() };
        
        mockFlameModel = {
            setFlameTexture: vi.fn()
        };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockFlameModel)
        };

        // Mock renderer for the payload
        mockRenderer = { type: 'mock-renderer' };

        // Instantiate with the mockRenderer as the payload
        command = new PrepareFlameCommand(mockRenderer);

        // Inject dependencies
        (command as any).assetService = mockAssetService;
        (command as any).signalBus = mockSignalBus;
        (command as any).modelMap = mockModelMap;
    });

    it('should generate texture, update model, and emit signal', async () => {
        await command.execute();

        // Verify the asset service was called with the renderer from the payload
        expect(mockAssetService.getFlameTexture).toHaveBeenCalledWith(mockRenderer);

        // Verify the model was updated with the generated texture
        expect(mockModelMap.get).toHaveBeenCalledWith(FlameModel.NAME);
        expect(mockFlameModel.setFlameTexture).toHaveBeenCalledWith({ mock: 'flame-texture' });

        // Verify the success signal was emitted
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.FLAME_PREPARED);
    });

    it('should log and re-throw error if texture generation fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const mockError = new Error('Baking failed');
        mockAssetService.getFlameTexture.mockRejectedValue(mockError);

        // Since the command re-throws, we expect it to reject
        await expect(command.execute()).rejects.toThrow('Baking failed');

        expect(errorSpy).toHaveBeenCalled();
        expect(mockSignalBus.emit).not.toHaveBeenCalled();
    });
});