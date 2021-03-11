import React from 'react';
import ReactDOM from 'react-dom';
import '@popup/style/index.scss';
import { Tabs } from '@popup/tabs.js';

class SettingInterface extends React.Component {



	constructor(props) {
		super(props);

		this.br = /Firefox/.test(navigator.userAgent) ? browser : chrome;
		this.state = {
			tabId: 1,
			accessSetting: false
		};

		this.getSettingData();

		this.br.runtime.onMessage.addListener(async (message) => {
			if (message.message === "settingData") { this.setState({ settingData: message.data, accessSetting: true }) }
		});
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
	async saveSetting() {
		this.br.runtime.sendMessage({
			message: "setSettingData",
			data: this.state.settingData
		});
	}
	getSettingData() {
		this.br.runtime.sendMessage({ message: "getSettingData" });
	}

	render() {
		if (this.state.accessSetting) {
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
		else {
			return (
				<h1>Loading...</h1>
			)
		}
	}
}


ReactDOM.render(
	<SettingInterface />,
	document.querySelector('.App')
);
