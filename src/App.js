import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import Board from './components/Board/Board';
import ConfirmDialog from './components/Dialog/ConfirmDialog';
import { EnumBoardStatus } from './constant/Constant';

class App extends Component {
	state = {
		mineSet: undefined,
		size: undefined,
		mines: undefined,
		status: EnumBoardStatus.INIT,
	};

	handleSelectMode = e => {
		const size = Number(e.target.dataset.size);
		const mines = Number(e.target.dataset.mines);
		this.setState({ size, mines, status: EnumBoardStatus.PENDING });
	};

	handleStartGame = (size, mines) => {
		fetch(`https://tiki-minesweeper.herokuapp.com/getMines?size=${size}&mines=${mines}`)
			.then(res => res.json())
			.then(({ data }) => {
				const mineSet = new Set();
				data.forEach(item => {
					mineSet.add(`${item.x}_${item.y}`);
				});

				this.setState({ size, mineSet, mines });
			});
	};

	handleChangeStatus = status => {
		this.setState({ status });
	};

	render() {
		const { status, size, mines } = this.state;

		if (status !== EnumBoardStatus.INIT) {
			return (
				<div className="app">
					<Board size={size} mines={mines} status={status} onChangeStatus={this.handleChangeStatus} />
				</div>
			);
		}

		return (
			<div className="app" style={{ border: '1px solid #615656', borderRadius: 5 }}>
				<div className="app__welcome">Welcome to Minesweeper</div>
				<div className="app__actions">
					<button className="app__btn btn" data-size="9" data-mines="10" onClick={this.handleSelectMode}>
						Beginner
					</button>
					<button className="app__btn btn" data-size="16" data-mines="40" onClick={this.handleSelectMode}>
						Advantage
					</button>
				</div>
			</div>
		);
	}
}

export default App;
