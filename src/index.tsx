import { Checkbox } from 'antd';
import * as _ from 'lodash';
import * as React from 'react';
import { render } from 'react-dom';
import { QuestionComponent } from './components/QuestionComponent';
import { StatsComponent } from './components/StatsComponent';
import { useLocalStorage } from './effects/useLocalStorage';
import './styles.css';
import { Question } from './types';

function App() {
	const [selectedQuestionCatalogues, setSelectedQuestionCatalogues] = useLocalStorage<string[]>('catalogues', [
		'Basis_Binnen',
	]);

	function listToDict(list: Question[]) {
		return list.filter((a) => a.id).reduce((a, v) => ({ ...a, [v.id!]: v }), {});
	}

	const [questionCatalogue, setQuestionCatalogue] = React.useState<Record<string, Question>>(
		listToDict(
			_.flatten(
				selectedQuestionCatalogues.map((file: string) => {
					/* eslint-disable */
					const questions: Question[] = require(`./data/${file}.json`);
					// add a unique id to each question:
					return questions.map((question, idx) => {
						return { ...question, id: `${idx}_${file}`, rightCount: 0, wrongCount: 0 };
					});
				})
			)
		)
	);

	const options = [
		{ label: 'Basis', value: 'Basis_Binnen' },
		{ label: 'Binnen Spezifisch', value: 'Spezifisch_Binnen' },
		{ label: 'See Spezifisch', value: 'Spezifisch_See' },
	];

	React.useEffect(() => {
		if (selectedQuestionCatalogues.length == 0) return;
		setQuestionCatalogue(
			listToDict(
				_.flatten(
					selectedQuestionCatalogues.map((file: string) => {
						/* eslint-disable */
						const questions: Question[] = require(`./data/${file}.json`);
						// add a unique id to each question:
						return questions.map((question, idx) => {
							return { ...question, id: `${idx}_${file}`, rightCount: 0, wrongCount: 0 };
						});
					})
				)
			)
		);
	}, [selectedQuestionCatalogues, setSelectedQuestionCatalogues]);

	function onQuestionCatalogueChange(checkedValues: any[]) {
		setSelectedQuestionCatalogues(checkedValues);
		console.log('Change in catalogue selection: ', checkedValues);
	}

	const selection = (
		<Checkbox.Group
			options={options}
			defaultValue={selectedQuestionCatalogues}
			onChange={onQuestionCatalogueChange}
		/>
	);

	const [progress, setProgress] = useLocalStorage<Record<string, { rightCount: number; wrongCount: number }>>(
		'progress',
		{}
	);
	return (
		<div className="App">
			<h1>{'Theoriefragen zum SBF Binnen & See'}</h1>
			{`${Object.keys(questionCatalogue).length} questions`}
			{selection}
			<QuestionComponent questionsDict={questionCatalogue} progress={progress} setProgress={setProgress} />

			<StatsComponent
				progress={progress}
				setProgress={setProgress}
				catalogues={selectedQuestionCatalogues}
				numberTotalQuestions={Object.keys(questionCatalogue).length}
			/>
		</div>
	);
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
