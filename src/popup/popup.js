import React from 'react';
import ReactDOM from 'react-dom';
import '@popup/style/index.scss';
import { Tabs } from '@popup/tabs.js';

class SettingInterface extends React.Component {

	constructor(props) {
		super(props);

		this.state = { tabId: 1 };

		let settingData = this.getSettingData();
		if (settingData) this.state.settingData = settingData;
		else {
			this.state = {
				settingData: {
					recognize: {
						scale: 1,
						confidenceSymbol: 80,
						confidenceWord: 25,
						confidenceLine: 60,
						confidenceText: 0,
					},
					control: {
						key: "[ctr]",
						button: false,
					},
					result: {
						validation: true,
						inBuffer: false,
						soundSignal: false,
						history: false,
						historyFullText: false,
					},
				},
			}
		}
	}

	changeTab(tabId) {
		this.setState({ tabId: tabId });
	}
	getChangeData(tabId, event) {
		const target = event.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		// creating object {name:value}
		let namedValue = {};
		namedValue[name] = value;
		// add "tab Name" and "namedValue" property in the data object
		let data = this.state.settingData;
		data[Tabs.getTab(tabId)] = { ...data[Tabs.getTab(tabId)], ...namedValue };
		this.setState({ data });
	}
	saveSetting() {
		localStorage.setItem("data", JSON.stringify(this.state.settingData));
	}
	getSettingData() {
		return JSON.parse(localStorage.getItem('data'));
	}
	render() {
		return (
			<div className="setting">
				<div className="setting__tab-switch tab-switch">
					<button className={"tab-switch__" + Tabs.getTab(1)} onClick={() => this.changeTab(1)}>Recognize</button>
					<button className={"tab-switch__" + Tabs.getTab(2)} onClick={() => this.changeTab(2)}>Control</button>
					<button className={"tab-switch__" + Tabs.getTab(3)} onClick={() => this.changeTab(3)}>Result</button>
					<button className="tab-switch__save" onClick={() => this.saveSetting()}>Save</button>
				</div>
				<Tabs
					tabId={this.state.tabId}
					data={this.state.settingData[Tabs.getTab(this.state.tabId)]}
					handleOnChange={(event) => this.getChangeData(this.state.tabId, event)}
				/>
			</div >
		)
	}
}


ReactDOM.render(
	<SettingInterface />,
	document.querySelector('.App')
);
