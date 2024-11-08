export interface Warehouse {
    id: bigint;
    name: string;
    item_id: bigint;
    user_id: bigint;
    thumbnail: string;
    favorite: boolean;
    memo: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ModalProps {
    warehouse: Warehouse;
    onClose: () => void;
    onUpdate?: (updatedWarehouse: Warehouse) => void;
}
