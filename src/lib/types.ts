// Database schema types
export interface Database {
	public: {
		Tables: {
			organizations: {
				Row: Organization;
				Insert: Omit<Organization, 'id' | 'created_at'>;
				Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
			};
			books: {
				Row: Book;
				Insert: Omit<Book, 'id' | 'created_at'>;
				Update: Partial<Omit<Book, 'id' | 'created_at'>>;
			};
			locations: {
				Row: Location;
				Insert: Omit<Location, 'id' | 'created_at'>;
				Update: Partial<Omit<Location, 'id' | 'created_at'>>;
			};
			copies: {
				Row: Copy;
				Insert: Omit<Copy, 'id' | 'created_at'>;
				Update: Partial<Omit<Copy, 'id' | 'created_at'>>;
			};
			children: {
				Row: Child;
				Insert: Omit<Child, 'id' | 'created_at'>;
				Update: Partial<Omit<Child, 'id' | 'created_at'>>;
			};
			loans: {
				Row: Loan;
				Insert: Omit<Loan, 'id' | 'created_at'>;
				Update: Partial<Omit<Loan, 'id' | 'created_at'>>;
			};
			reading_journal: {
				Row: JournalEntry;
				Insert: Omit<JournalEntry, 'id' | 'created_at'>;
				Update: Partial<Omit<JournalEntry, 'id' | 'created_at'>>;
			};
			admins: {
				Row: Admin;
				Insert: Omit<Admin, 'id' | 'created_at'>;
				Update: Partial<Omit<Admin, 'id' | 'created_at'>>;
			};
		};
	};
}

export interface Organization {
	id: string; // UUID
	name: string;
	created_at: string;
	settings?: Record<string, unknown>;
}

export interface Book {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	title: string;
	authors: string[]; // Array of author names
	isbn?: string;
	cover_url?: string;
	metadata?: Record<string, unknown>; // Additional book info (language, publication_year, publisher, pages, genre, reading_level, etc.)
	created_at: string;
	updated_at?: string;
	deleted_at?: string; // Soft delete
}

export interface Location {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	name: string;
	description?: string;
	created_at: string;
	deleted_at?: string; // Soft delete
}

export interface Copy {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	book_id: string; // FK to books
	location_id?: string; // FK to locations
	barcode?: string;
	status: 'available' | 'checked_out' | 'lost' | 'damaged';
	notes?: string;
	created_at: string;
	updated_at?: string;
	deleted_at?: string; // Soft delete
}

export interface Child {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	emoji_id: string; // 3-emoji unique identifier (e.g., "🐶🌈🎨")
	name?: string; // Optional real name
	grade_or_class?: string;
	created_at: string;
	updated_at?: string;
	deleted_at?: string; // Soft delete
}

export interface Loan {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	copy_id: string; // FK to copies
	child_id?: string; // FK to children (optional)
	borrower_name?: string; // Fallback if no child_id
	borrower_class?: string;
	checked_out_at: string;
	due_date?: string;
	returned_at?: string;
	notes?: string;
	created_at: string;
}

export interface JournalEntry {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	child_id: string; // FK to children
	book_id: string; // FK to books
	rating?: number; // 1-5 stars
	review?: string;
	read_date?: string;
	created_at: string;
}

export interface Admin {
	id: string; // UUID
	org_id: string; // UUID - multi-tenant FK
	user_id: string; // FK to auth.users
	email: string;
	role: 'admin' | 'superadmin';
	created_at: string;
}

// API response types
export interface ApiError {
	error: string;
	details?: unknown;
}

export interface ApiSuccess<T = unknown> {
	data: T;
	message?: string;
}

// Form validation schemas will use these types
export interface BookFormData {
	title: string;
	authors: string[];
	isbn?: string;
	cover_url?: string;
	metadata?: Record<string, unknown>;
}

export interface CopyFormData {
	book_id: string;
	location_id?: string;
	barcode?: string;
	status: Copy['status'];
	notes?: string;
}

export interface ChildFormData {
	name?: string;
	grade_or_class?: string;
}

export interface LoanFormData {
	copy_id: string;
	child_id?: string;
	borrower_name?: string;
	borrower_class?: string;
	due_date?: string;
	notes?: string;
}

export interface JournalEntryFormData {
	child_id: string;
	book_id: string;
	rating?: number;
	review?: string;
	read_date?: string;
}

// Joined data types for display
export interface CopyWithBook extends Copy {
	book: Book;
	location?: Location;
}

export interface LoanWithDetails extends Loan {
	copy: CopyWithBook;
	child?: Child;
}

export interface JournalEntryWithDetails extends JournalEntry {
	book: Book;
}
