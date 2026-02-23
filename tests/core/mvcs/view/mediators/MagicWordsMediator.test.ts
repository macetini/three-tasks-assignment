import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MagicWordsModel } from '../../../../../src/core/mvcs/model/states/MagicWordsModel';
import { MagicWordsView } from '../../../../../src/core/mvcs/view/components/MagicWordsView';
import { MagicWordsMediator } from '../../../../../src/core/mvcs/view/mediators/MagicWordsMediator';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('MagicWordsMediator', () => {
    let mediator: MagicWordsMediator;
    let view: MagicWordsView;
    
    let mockSignalBus: any;
    let mockModelMap: any;
    let mockModel: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Use the REAL view. It has all the methods from AbstractView/TaskView.
        view = new MagicWordsView();
        view.init();

        // Add Spies
        vi.spyOn(view, 'showLoading');
        vi.spyOn(view, 'hideLoading');
        vi.spyOn(view, 'buildRows');
        vi.spyOn(view, 'playChatEntrance');
        vi.spyOn(view, 'emit');

        // Mock SignalBus
        mockSignalBus = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };
        // Mock Model and Map
        mockModel = {
            words: [{ id: 'msg_1', text: 'Hello' }],
            getTexture: vi.fn().mockReturnValue({}),
            getPosition: vi.fn().mockReturnValue({ x: 10, y: 10 })
        };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockModel)
        };

        // Instantiate and Inject (The TaskMediator way)
        mediator = new MagicWordsMediator(view);
        mediator.setSignalBus(mockSignalBus);

        // Inject modelMap - using 'any' if TaskMediator doesn't have a public setter
        (mediator as any).modelMap = mockModelMap;

        // TaskMediator also seems to require setApp
        mediator.setApp({ renderer: {} } as any);
    });

    it('should register MAGIC_WORDS_LOADED listener during init', () => {
        // Accessing protected method via 'any' for testing
        (mediator as any).initListener();

        expect(mockSignalBus.on).toHaveBeenCalledWith(
            ModelSignals.MAGIC_WORDS_LOADED,
            expect.any(Function),
            mediator
        );
    });

    it('should show loading and emit fetch signal when view is added', () => {
        (mediator as any).onViewAddedToRoot();

        expect(view.showLoading).toHaveBeenCalled();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.FETCH_MAGIC_WORDS);
    });

    it('should build rows with data and providers when words are loaded', () => {
        // Manually trigger the private callback
        (mediator as any).onWordsLoaded();

        expect(mockModelMap.get).toHaveBeenCalledWith(MagicWordsModel.NAME);
        expect(view.hideLoading).toHaveBeenCalled();

        // Verify buildRows was called with the correct words and provider object
        expect(view.buildRows).toHaveBeenCalledWith(
            mockModel.words,
            expect.objectContaining({
                textureProvider: expect.any(Function),
                positionProvider: expect.any(Function)
            })
        );

        // Verify animation trigger
        expect(view.playChatEntrance).toHaveBeenCalled();
    });

    it('should correctly proxy provider calls to the model', () => {
        (mediator as any).onWordsLoaded();

        // Wrap the method in vi.mocked to get the .mock property
        const buildRowsMock = vi.mocked(view.buildRows);
        const providers = buildRowsMock.mock.calls[0][1];

        providers.textureProvider('avatar_id');
        providers.positionProvider('user_name');

        expect(mockModel.getTexture).toHaveBeenCalledWith('avatar_id');
        expect(mockModel.getPosition).toHaveBeenCalledWith('user_name');
    });

    it('should clean up the specific signal listener on removal', () => {
        mediator.onRemove();

        expect(mockSignalBus.off).toHaveBeenCalledWith(
            ModelSignals.MAGIC_WORDS_LOADED,
            expect.any(Function)
        );
    });
});