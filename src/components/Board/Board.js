import React, { PureComponent, Fragment } from 'react';
import Cell from './Cell';
import Timer from './Timer';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import './styles.scss';
import { EnumBoardStatus, EnumCellWeight } from '../../constant/Constant';

class Board extends PureComponent {
	state = {
		isClicking: false,
		boardMap: {},
		isFetching: false,
	};

	timerRef = React.createRef();
	totalReveal = 999;

	componentDidMount() {
		this.generateBoardMap();
	}

	handleRestartGame = () => {
		const { onChangeStatus } = this.props;
		onChangeStatus(EnumBoardStatus.PENDING);
		this.generateBoardMap();
	};

	generateBoardMap = () => {
		const { size, mines } = this.props;

		this.setState({ isFetching: true });

		fetch(`https://tiki-minesweeper.herokuapp.com/getMines?size=${size}&mines=${mines}`)
			.then(res => res.json())
			.then(({ data }) => {
				this.mineSet = new Set();
				data.forEach(item => {
					this.mineSet.add(`${item.x}_${item.y}`);
				});

				const boardMap = {};
				for (let x = 0; x < size; x++) {
					for (let y = 0; y < size; y++) {
						const cellId = `${x}_${y}`;
						boardMap[cellId] = { isOpen: false, weight: this.getCellWeight(x, y), x, y };
					}
				}
				this.totalReveal = 0;
				this.setState({ boardMap, isFetching: false });
			});
	};

	getCellWeight = (x, y) => {
		const { mineSet } = this;
		const cellId = `${x}_${y}`;
		if (mineSet.has(cellId)) {
			return 9;
		}

		let weight = 0;
		if (mineSet.has(`${x}_${y - 1}`)) weight++; //bottom
		if (mineSet.has(`${x}_${y + 1}`)) weight++; //top
		if (mineSet.has(`${x - 1}_${y}`)) weight++; //left
		if (mineSet.has(`${x + 1}_${y}`)) weight++; //right
		if (mineSet.has(`${x - 1}_${y - 1}`)) weight++; //bottom-right
		if (mineSet.has(`${x - 1}_${y + 1}`)) weight++; //bottom-left
		if (mineSet.has(`${x + 1}_${y - 1}`)) weight++; //top-left
		if (mineSet.has(`${x + 1}_${y + 1}`)) weight++; //top-right

		return weight;
	};

	handleVisitCell = visitedCell => {
		this.visitedCell = visitedCell;
	};

	handleMouseDown = e => {
		if (e.button === 0) {
			//left-click only
			this.setState({ isClicking: true });
		}
	};

	handleMouseLeave = () => {
		this.visitedCell = undefined;
		this.setState({ isClicking: false });
	};

	handleMouseUp = e => {
		if (e.button === 0) {
			//left-click only
			this.setState({ isClicking: false }, () => this.handleSelectCell(this.visitedCell));
		}
	};

	travelAndRevealCell = (prevBoardMap, x, y) => {
		const { size } = this.props;
		let boardMap = prevBoardMap;
		const cellId = `${x}_${y}`;
		const cell = boardMap[cellId];

		if (x < 0 || y < 0 || x >= size || y >= size) {
			return prevBoardMap;
		}

		// do nothing if cell has already opened or flagged
		if (cell.isOpen || cell.isFlagged) {
			return boardMap;
		}

		// reveal visited cell
		boardMap = {
			...boardMap,
			[cellId]: {
				...cell,
				isOpen: true,
			},
		};
		this.totalReveal++;

		// reveal all around visited cell if it's empty
		if (cell.weight === EnumCellWeight.ZERO) {
			boardMap = this.travelAndRevealCell(boardMap, x, y - 1);
			boardMap = this.travelAndRevealCell(boardMap, x, y - 1);
			boardMap = this.travelAndRevealCell(boardMap, x, y + 1);
			boardMap = this.travelAndRevealCell(boardMap, x - 1, y);
			boardMap = this.travelAndRevealCell(boardMap, x + 1, y);
			boardMap = this.travelAndRevealCell(boardMap, x - 1, y - 1);
			boardMap = this.travelAndRevealCell(boardMap, x + 1, y - 1);
			boardMap = this.travelAndRevealCell(boardMap, x - 1, y + 1);
			boardMap = this.travelAndRevealCell(boardMap, x + 1, y + 1);
		}

		return boardMap;
	};

	handleSelectCell = (cell) => {
		if (!cell) {
			return;
		}

		const { onChangeStatus, status, size } = this.props;
		const { weight, x, y } = cell;

		// enable time counter when click on the first button
		if (status === EnumBoardStatus.PENDING) {
			onChangeStatus(EnumBoardStatus.PLAYING);
			this.timerRef.current.startCounting();
		}

		// end game if user click on bomb
		if (weight === EnumCellWeight.BOMB) {
			onChangeStatus(EnumBoardStatus.LOSE);
			this.timerRef.current.stopCounting();
			return;
		}

		// get new boardMap when user click on a valid cell
		const boardMap = this.travelAndRevealCell(this.state.boardMap, x, y);
		this.setState({ boardMap });
		// win game
		if (this.totalReveal === size * size - this.mineSet.size) {
			onChangeStatus(EnumBoardStatus.WIN);
			this.timerRef.current.stopCounting();
			return;
		}
		this.visitedCell = undefined;
	};

	handleFlagCell = cell => {
		const { boardMap } = this.state;
		const { x, y } = cell;

		this.setState({
			boardMap: {
				...boardMap,
				[`${x}_${y}`]: {
					...cell,
					isFlagged: !cell.isFlagged,
				},
			},
		});
	};

	renderBoard() {
		const board = [];
		const { boardMap, isClicking } = this.state;
		const { size, status } = this.props;

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const cellId = `${x}_${y}`;
				board.push(
					<Cell
						key={cellId}
						cell={boardMap[cellId] || {}}
						onVisitCell={this.handleVisitCell}
						isClicking={isClicking}
						onFlagCell={this.handleFlagCell}
						status={status}
						visitedCell={this.visitedCell}
						onSelectCell={this.handleSelectCell}
					/>
				);
			}
		}

		return board;
	}

	render() {
		const { size, status, onChangeStatus, mines } = this.props;
		const { isFetching } = this.state;
		const isEndGame = status === EnumBoardStatus.WIN || status === EnumBoardStatus.LOSE;

		return (
			<div
				className="board"
				onMouseDown={this.handleMouseDown}
				onMouseUp={this.handleMouseUp}
				onMouseLeave={this.handleMouseLeave}
				style={{ pointerEvents: isEndGame || isFetching ? 'none' : 'unset' }}
			>
				{isFetching && <div className="board__extra-info">Getting data...! Please wait</div>}
				<div className="board__header">
					<Timer defaultCount={mines} />
					<Timer ref={this.timerRef} />
				</div>
				<div className="board__body" style={{ width: 16 * size, height: 16 * size }}>
					{this.renderBoard()}
				</div>
				{isEndGame && (
					<ConfirmDialog
						status={status}
						onRestartGame={this.handleRestartGame}
						onChangeStatus={onChangeStatus}
						totalSecond={this.timerRef.current.getTime()}
					/>
				)}
			</div>
		);
	}
}

export default Board;
