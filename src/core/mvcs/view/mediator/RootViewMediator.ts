import { RootView } from '../component/RootView';
import { MediatorMap } from '../MediatorMap';
import { AssetService } from '../../service/AssetService';

// Import Views for the switcher
import { MainMenuView } from '../component/MainMenuView';
import { AbstractMediator } from '../AbstractMediator';
import type { AbstractView } from '../AbstractView';

export class RootViewMediator extends AbstractMediator<RootView> {
    private _activeTaskMediator: AbstractMediator<any> | null = null;

    constructor(view: RootView) {
        super(view);
    }

    public override onRegister(): void {
        console.log("[RootViewMediator] Initializing Application Layers...");

        // 1. Setup the Permanent UI (Menu)
        this.initMenu();

        // 2. Listen for the Global Task Switch event
        window.addEventListener('SWITCH_TASK', (e: any) => this.onSwitchTask(e.detail));

        // 3. Load the default Task (Task 1)
        this.onSwitchTask('CARDS');
    }

    private initMenu(): void {
        const menuView = new MainMenuView();

        // PLACE in the UI Layer (Always on top)
        this.view.addUI(menuView);

        // REGISTER the mediator
        const menuMediator = this.mediatorMap.register(menuView);
        menuMediator.onRegister();
    }

    private onSwitchTask(taskType: string): void {
        console.log(`[RootViewMediator] Switching to task: ${taskType}`);

        // Clean up current task before starting new one
        if (this._activeTaskMediator) {
            this._activeTaskMediator.onRemove();
            this._activeTaskMediator = null;
        }

        /*
        if (taskType === 'CARDS') {
            this.showTask(AceOfShadowsView);
        } else if (taskType === 'FIRE') {
            // this.showTask(MagicFireView);
        }*/
    }

    /*private showTask(ViewClass: new (as: AssetService) => AbstractView): void {
        // 1. Create View Instance
        const viewInstance = new ViewClass();//this.assetService);

        // 2. PLACE in the Task Layer (RootView handles cleanup of old children)
        this.view.setTaskView(viewInstance);

        // 3. REGISTER & INIT Mediator
        this._activeTaskMediator = this._mediatorMap.register(viewInstance);
        this._activeTaskMediator.initialize();
    }*/

    public override onRemove(): void {
        //window.removeEventListener('SWITCH_TASK', this.onSwitchTask);
        if (this._activeTaskMediator) this._activeTaskMediator.onRemove();
        super.onRemove();
    }
}