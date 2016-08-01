require('normalize.css/normalize.css');

import styles from 'styles/App.icss';
import React from 'react';
import moment from 'moment';

let data = require('../transactions.js');

class AppComponent extends React.Component {
	render() {
		var summary = data
			.plasticCardData[0]
			.vauchers[1]
			.vauchersByCurrencyCodes[0]
			.vaucherDetails[20160802]
			.reverse();

		console.log(summary);
		var lastRenderedDate;

		return (
			<div className={styles.index}>
				<div className={styles.tabs}>
					<button className={styles.tab + ' ' + styles.selected}>Expanses</button>
					<button className={styles.tab}>Total</button>
				</div>
				<div className={styles.transactions}>
					{summary.map((transaction, idx) => {
						var transactionDiv = (<div
								className={styles.transaction}
								key={idx}>
							<div className={styles.amount + ' ' + (transaction.debitAmount <= 0 ? styles.isNegative : '')}>
								<div className={styles.amountContent}>
									{transaction.debitAmount}
									<div className={styles.nisSymbol}>₪</div>
								</div>
							</div>
							<div className={styles.title}>{transaction.clientBusinessName}</div>
						</div>);
						debugger;
						if (lastRenderedDate !== transaction.formattedEventDate) {
							lastRenderedDate = transaction.formattedEventDate;

							return [
								<div className={styles.date}>{moment(lastRenderedDate).calendar()}</div>,
								transactionDiv
							];
						} else {
							return transactionDiv;
						}
					})}
				</div>
			</div>
		);
	}
}

AppComponent.defaultProps = {
};

export default AppComponent;
