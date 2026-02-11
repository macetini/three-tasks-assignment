// src/core/mvcs/model/vo/MagicWordVO.ts
export interface MagicWordVO {
    id: string;
    value: string;
}

export interface MagicWordsResponse {
    data: MagicWordVO[];
}