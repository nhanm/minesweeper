import React, { Component } from 'react';
import classNames from 'classnames';
import { EnumCellWeight, EnumBoardStatus } from '../../constant/Constant';

class Cell extends Component {
	state = {
		isVisiting: false,
	};

	static defaultProps = {
		cell: {}
	}

	handleMouseEnter = e => {
		const { isClicking, onVisitCell, cell } = this.props;

		// can not visit if cell is flagged
		if (!cell.isFlagged) {
			this.setState({ isVisiting: true }, () => {
				onVisitCell(cell);
			});
		}
	};

	handleMouseLeave = () => {
		this.setState({ isVisiting: false });
	};

	handleFlagCell = e => {
		e.preventDefault();
		const { onFlagCell, cell } = this.props;
		onFlagCell(cell);
	};

	render() {
		const { cell = {}, isClicking, status, visitedCell = {} } = this.props;
		const { isVisiting } = this.state;
		// const { isOpen = false, isFlagged = false, weight = 0} = cell

		return (
			<div
				className={classNames({
					cell: true,
					'cell--blank': !cell.isOpen,
					'cell--bomb-flagged': cell.isFlagged,
					[`cell--visited`]: isClicking && isVisiting,
					[`cell--open${cell.weight}`]:
						status === EnumBoardStatus.WIN || status === EnumBoardStatus.LOSE || cell.isOpen,
					'cell--bomb-revealed':
						(status === EnumBoardStatus.WIN || status === EnumBoardStatus.LOSE) && cell.weight === 9,
					'cell--bomb-death': status === EnumBoardStatus.LOSE && visitedCell.x === cell.x && visitedCell.y === cell.y,
				})}
				onMouseOver={this.handleMouseEnter}
				onMouseOut={this.handleMouseLeave}
				onContextMenu={this.handleFlagCell}
			/>
		);
	}
}

export default Cell;
