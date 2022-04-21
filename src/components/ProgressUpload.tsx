import { Button, Input } from 'antd';
import * as React from 'react';
import '../styles.css';

export function ProgressUpload(props: { setProgress: any }) {
	const { setProgress } = props;
	const { TextArea } = Input;
	const [progressInput, setProgressInput] = React.useState({});
	const [valid, setValid] = React.useState(false);

	const uploadNewProgress = (e: any) => {
		if (valid) setProgress(progressInput);
	};

	const checkInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		try {
			const newProgress = JSON.parse(e.currentTarget.value) as Record<
				string,
				{ rightCount: number; wrongCount: number }
			>;

			Object.keys(newProgress).map((questionId) => {
				if (isNaN(parseInt(questionId.split('_')[0]))) throw Error("Couldn't parse question number");
				if (isNaN(newProgress[questionId].rightCount)) throw Error("Couldn't parse rightCount");
				if (isNaN(newProgress[questionId].wrongCount)) throw Error("Couldn't parse wrongCount");
			});

			setValid(true);
			setProgressInput(newProgress);
		} catch (e) {
			console.log(e);
			setValid(false);
		}
	};

	return (
		<div className="StatsContainer">
			<div>
				<TextArea showCount defaultValue="{}" onChange={checkInput} status={valid ? '' : 'error'} />
				<Button disabled={!valid} onClick={uploadNewProgress} type="primary">
					Update current progress
				</Button>
			</div>
		</div>
	);
}
