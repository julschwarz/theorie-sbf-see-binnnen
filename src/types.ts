export interface Question {
	images: Image[];
	question: string;
	responses: Response[];
	id: string;
	rightCount: number;
	wrongCount: number;
}

export interface Response {
	correct: boolean;
	text: string;
}

export interface Image {
	src: string;
	title: string;
}
