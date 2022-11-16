export interface PanelTabInfo<T extends HTMLElement> {
  name: string;
  id: number;
  content: T[];
}

export interface PanelTabInfoWithActive<T extends HTMLElement>
  extends PanelTabInfo<T> {
  active: boolean;
}
