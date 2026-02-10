import type { AbstractMediator } from "../AbstractMediator";
import type { AbstractView } from "../AbstractView";

export type AbstractMediatorType<T extends AbstractView> = new (view: T) => AbstractMediator<T>;