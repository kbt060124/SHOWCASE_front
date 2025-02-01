export interface Warehouse {
    id: bigint;
    name: string;
    item_id: bigint;
    user_id: bigint;
    thumbnail: string;
    memo: string | null;
    total_size: number;
    filename: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface ModalProps {
    warehouse: Warehouse;
    onClose: () => void;
    onDelete: (id: bigint) => void;
    onUpdate: (updatedWarehouse: Warehouse) => void;
}
