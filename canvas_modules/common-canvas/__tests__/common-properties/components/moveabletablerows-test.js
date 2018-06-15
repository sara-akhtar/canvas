/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import MoveableTableRows from "../../../src/common-properties/components/moveable-table-rows";
import FlexibleTable from "../../../src/common-properties/components/flexible-table";
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";

chai.use(chaiEnzyme()); // Note the invocation at the end

const handleRowClick = sinon.spy();
const setScrollToRow = sinon.spy();

const controller = new Controller();
const control = {
	"name": "test-moveabletablerows",
	"controlType": "structuretable",
	"moveableRows": true,
	"addRemoveRows": true,
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "field",
			"label": {
				"text": "Field"
			},
			"visible": true,
			"width": 28,
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"filterable": true
		},
		{
			"name": "sort_order",
			"label": {
				"text": "Order"
			},
			"visible": true,
			"width": 16,
			"controlType": "toggletext",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"values": [
				"Ascending",
				"Descending"
			],
			"valueLabels": [
				"Ascending",
				"Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg",
				"/images/down-triangle.svg"
			]
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"Ascending"
	]
};

const controlValue = [
	["Na", "Ascending"],
	["Age", "Descending"],
	["Sex", "Descending"],
	["Gender", "Ascending"],
	["Occupation", "Descending"],
	["Address", "Descending"]
];

const rows = [
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Na" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Sex" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Gender" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Occupation" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Address" },
			{ column: "sortOrder", content: "Descending" }
		]
	}
];

const headers = [
	{ "key": "fields", "label": "Field Name" },
	{ "key": "sortOrder", "label": "Sort Direction" },
];
const content = (<div>
	<FlexibleTable
		columns={headers}
		data={rows}
	/>
</div>
);

propertyUtils.setControls(controller, [control]);

function setControlValues(selection) {
	controller.updatePropertyValue(propertyId, getCopy(controlValue));
	controller.updateSelectedRows(control.name, selection);
}

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function setCurrentControlValueSelected(inControlValue, inSelectedRows) {
	controller.updatePropertyValue(propertyId, getCopy(inControlValue));
	controller.updateSelectedRows(control.name, inSelectedRows);
}

const propertyId = { name: "test-moveabletablerows" };

describe("MoveableTableRows renders correctly", () => {

	it("props should have been defined", () => {
		setControlValues([]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		expect(wrapper.prop("setScrollToRow")).to.equal(setScrollToRow);
		expect(wrapper.prop("setCurrentControlValueSelected")).to.equal(setCurrentControlValueSelected);
	});

	it("should select no rows and all move buttons disabled", () => {
		setControlValues([]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer).to.have.length(1);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should select top row and move down one row", () => {
		setControlValues([0]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer).to.have.length(1);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Na");
	});

	it("should select top row and move down to bottom row", () => {
		setControlValues([0]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 1][0]).to.equal("Na");


	});

	it("should select bottom row and move up one row", () => {
		setControlValues([rows.length - 1]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

		// validate the bottom row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[rows.length - 2][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select bottom row and move up to top row", () => {
		setControlValues([rows.length - 1]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});


	it("should select middle row and all move buttons enabled ", () => {
		setControlValues([2]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(4);
	});

});