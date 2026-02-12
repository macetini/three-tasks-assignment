// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { ModelSignals } from '../../../signal/ModelSignals';
import { MagicWordsModel } from '../../model/states/MagicWordsModel';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

/**
 * Mediator for the Magic Words chat feature.
 * Manages the lifecycle of data fetching, loading state visualization, 
 * and the distribution of Model data to the View via functional providers.
 */
export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    /**
     * Called after the view is registered.
     * Sets up the event listeners and performs the necessary setup.
     * Listens for the ModelSignals.MAGIC_WORDS_LOADED signal and calls onWordsLoaded when it is emitted.
     */
    public override onRegister(): void {
        super.onRegister();
        this.signalBus.on(ModelSignals.MAGIC_WORDS_LOADED, this.onWordsLoaded, this);
    }

    /**
     * Called when the view is added to the stage.
     * Shows the loading indicator and triggers a layout update.
     * Emits the ModelSignals.FETCH_MAGIC_WORDS signal to trigger the loading of the MagicWords data.
     */
    protected override onViewAddedToRoot(): void {
        super.onViewAddedToRoot();
        this.viewComponent.showLoading();
        this.triggerLayout();

        this.signalBus.emit(ModelSignals.FETCH_MAGIC_WORDS);
    }

    /**
     * Called when the MagicWordsModel emits the MAGIC_WORDS_LOADED signal.
     * Hides the loading indicator, populates the MagicWordsView with the chat rows, and triggers a layout update.
     * Logs a debug message indicating the number of chat rows rendered.
     */
    private onWordsLoaded(): void {
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        const words = model.words;

        const textureProvider = (id: string) => model.getTexture(id);
        const positionProvider = (name: string) => model.getPosition(name);

        this.viewComponent.hideLoading();
        this.viewComponent.buildRows(words, { textureProvider, positionProvider });

        this.triggerLayout();

        console.debug(`[MagicWordsMediator] Rendered ${words.length} chat rows.`);
    }


    /**
     * Removes all event listeners and cleans up the mediator for garbage collection.
     * Should be called when the mediator is no longer needed.
     * Offs the ModelSignals.MAGIC_WORDS_LOADED event listener.
     */
    public override onRemove(): void {
        this.signalBus.off(ModelSignals.MAGIC_WORDS_LOADED, this.onWordsLoaded);
        super.onRemove();
    }

    /**
     * Returns the MagicWordsView component.
     * Can be cast to the specific MagicWordsView type.
     */
    protected override get viewComponent(): MagicWordsView {
        return this.view;
    }

}