import { AbstractMediator } from "../AbstractMediator";
import type { MainView } from "../component/MainView";

export class MainMediator extends AbstractMediator<MainView> {

    constructor(view: MainView) {
        super(view);
    }
}