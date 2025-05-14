export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    nameDisplay?: string;
    height?: number;
    weight?: number;
    dob?: Date;
    gender?: string;
    has_hypertension?: boolean;
    has_diabetes?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
