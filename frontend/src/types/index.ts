// src/types/index.ts

export interface User {
    id: number;
    nickname: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    sex?: 'M' | 'F' | 'O' | '';
    math_level?: 'beginner' | 'intermediate' | 'advanced';
    avatar?: string | null;
    is_staff?: boolean;
}

export interface Category {
    category_id: number;
    title: string;
    slug: string;
}

export interface Course {
    course_id: number;
    name: string;
    price: number;
    discount: number;
    discounted_price: number;
    rating: number;
    status: 'draft' | 'published' | 'archived';
    description: string;
    image: string | null;
    category_title?: string;
    author_name?: string;
    created_at?: string;
    lessons?: Lesson[];
}

export interface Lesson {
    lesson_id: number;
    order: number;
    name: string;
    text_content: string;
    video?: string;
}

export interface PurchasedCourse {
    id: number;
    course: Course;
    progress: number;
    purchased_at: string;
    status: string;
}

export interface Notification {
    id: number;
    type: string;
    message: string;
    created_at: string;
    is_read: boolean;
}