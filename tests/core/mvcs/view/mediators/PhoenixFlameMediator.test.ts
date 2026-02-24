import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlameModel } from '../../../../../src/core/mvcs/model/states/FlameModel';
import { PhoenixFlameView } from '../../../../../src/core/mvcs/view/components/PhoenixFlameView';
import { PhoenixFlameMediator } from '../../../../../src/core/mvcs/view/mediators/PhoenixFlameMediator';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('PhoenixFlameMediator', () => {
    let mediator: PhoenixFlameMediator;
    let mockView: PhoenixFlameView;
    let mockSignalBus: any;
    let mockApp: any;
    let mockModelMap: any;

    beforeEach(() => {
        vi.restoreAllMocks();

        mockView = new PhoenixFlameView();
        vi.spyOn(mockView, 'setupFire');
        vi.spyOn(mockView, 'update');

        mockSignalBus = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };

        mockApp = {
            renderer: { type: 'mock-renderer' },
            ticker: {
                add: vi.fn(),
                remove: vi.fn(),
                deltaTime: 1
            }
        };

        const mockFlameModel = { flameTexture: { mock: 'texture' } };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockFlameModel)
        };

        mediator = new PhoenixFlameMediator(mockView);

        // Inject dependencies
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
        (mediator as any).app = mockApp;
        (mediator as any).modelMap = mockModelMap;
    });

    it('should register for FLAME_PREPARED and add to ticker on register', () => {
        mediator.onRegister();

        expect(mockSignalBus.on).toHaveBeenCalledWith(ModelSignals.FLAME_PREPARED, expect.any(Function), mediator);
        expect(mockApp.ticker.add).toHaveBeenCalledWith(expect.any(Function), mediator);
    });

    it('should emit PREPARE_FLAME when view is added to root', () => {
        mediator.onViewAddedToRoot();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.PREPARE_FLAME, mockApp.renderer);
    });

    it('should call view.update during ticker update', () => {
        mediator.onRegister();

        // Get the update function that was passed to the ticker
        const updateCallback = mockApp.ticker.add.mock.calls[0][0];

        // Trigger the update
        updateCallback();

        expect(mockView.update).toHaveBeenCalledWith(mockApp.ticker.deltaTime);
    });

    it('should setup fire in view when flame is prepared', () => {
        mediator.onRegister();

        // Get the onFlamePrepared callback
        const preparedCallback = mockSignalBus.on.mock.calls.find(
            (call: any) => call[0] === ModelSignals.FLAME_PREPARED
        )[1];

        preparedCallback();

        expect(mockModelMap.get).toHaveBeenCalledWith(FlameModel.NAME);
        expect(mockView.setupFire).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should cleanup ticker and signals on remove', () => {
        mediator.onRemove();

        expect(mockSignalBus.off).toHaveBeenCalledWith(ModelSignals.FLAME_PREPARED, expect.any(Function));
        expect(mockApp.ticker.remove).toHaveBeenCalledWith(expect.any(Function), mediator);
    });
});