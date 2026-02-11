// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { ModelType } from '../../../signal/type/ModelType';
import { MagicWordsModel } from '../../model/states/MagicWordsModel';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';
import { RichTextRow } from '../components/ui/RichTextRow';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelType.MAGIC_WORDS_LOADED, this.onWordsLoaded, this);
        this.signalBus.emit(ModelType.FETCH_MAGIC_WORDS);
    }

    private onWordsLoaded(): void {
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        const words = model.words;

        let currentY = 0;
        const spacing = 20;

        words.forEach((vo) => {
            // 1. Get the layout strategy for this character
            const position = model.getPosition(vo.characterName);

            // 2. Create the row (We'll build this class next)
            const row = new RichTextRow(vo, position);

            // 3. Stack vertically
            row.y = currentY;
            this.view.addRow(row);

            // 4. Increment Y based on the dynamic height of the text
            currentY += row.height + spacing;
        });

        console.debug(`[MagicWordsMediator] Rendered ${words.length} chat rows.`);
    }

    public override onRemove(): void {
        this.signalBus.off(ModelType.MAGIC_WORDS_LOADED, this.onWordsLoaded);
        super.onRemove();
    }
}