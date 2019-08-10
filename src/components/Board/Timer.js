import React, { Component } from 'react';

class Timer extends Component {
	state = {
		count: 0,
	};

	startCounting = () => {
		this.countingInterval = setInterval(() => {
			const { count } = this.state;
			this.setState({ count: count + 1 });
		}, 1000);
	};

	stopCounting = () => {
		clearInterval(this.countingInterval);
	};

	getTime = () => this.state.count;

	render() {
		const count = this.props.defaultCount || this.state.count;
		const hundreds = parseInt(count / 100, 10);
		const tens = parseInt((count - hundreds * 100) / 10, 10);
		const seconds = parseInt(count - hundreds * 100 - tens * 10);

		return (
			<div className="timer">
				<div className={`timer__time timer__time--time${hundreds}`} />
				<div className={`timer__time timer__time--time${tens}`} />
				<div className={`timer__time timer__time--time${seconds}`} />
			</div>
		);
	}
}

export default Timer;
