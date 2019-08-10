import React, { Component } from 'react';
import Dialog from './Dialog';
import './styles.scss';
import { EnumBoardStatus } from '../../constant/Constant';

class ConfirmDialog extends Component {
	gotoHome = () => {
		const { onChangeStatus } = this.props;
		onChangeStatus(EnumBoardStatus.INIT);
	};

	convertToTwoDigit = num => {
		return String(num).padStart(2, '0');
	};

	render() {
		const { onRestartGame, status, totalSecond } = this.props;
		const hours = parseInt(totalSecond / 3600, 10);
		const minutes = parseInt((totalSecond - hours * 3600) / 60, 10);
		const seconds = parseInt(totalSecond - hours * 3600 - minutes * 60);

		return (
			<Dialog>
				<div className="dialog">
					<div className="dialog__mask" />
					<div className="dialog__content">
						<div className="dialog__message">
							You {status === EnumBoardStatus.WIN ? 'win' : 'lost'} the game in {this.convertToTwoDigit(hours)}:
							{this.convertToTwoDigit(minutes)}:{this.convertToTwoDigit(seconds)}
						</div>
						<div className="dialog__footer">
							<div className="btn" onClick={onRestartGame}>
								New Game
							</div>
							<div className="btn" onClick={this.gotoHome} style={{ marginLeft: 10 }}>
								Home Page
							</div>
						</div>
					</div>
				</div>
			</Dialog>
		);
	}
}

export default ConfirmDialog;
