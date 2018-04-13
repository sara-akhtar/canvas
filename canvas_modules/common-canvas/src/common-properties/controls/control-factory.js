/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 30] */

import React from "react";

import { Type, ControlType } from "./../constants/form-constants";
import { VALIDATION_MESSAGE, STATES } from "./../constants/constants.js";
import { PropertyDef } from "./../form/PropertyDef";
import { makeControl } from "./../form/EditorForm";
import { L10nProvider } from "./../form/L10nProvider";

import TextfieldControl from "./textfield";
import ReadonlyControl from "./readonly";
import ToggletextControl from "./toggletext";
import TextareaControl from "./textarea";
import ExpressionControl from "./expression";
import PasswordControl from "./passwordfield";
import NumberfieldControl from "./numberfield";
import DatefieldControl from "./datefield";
import TimefieldControl from "./timefield";
import CheckboxControl from "./checkbox";
import CheckboxsetControl from "./checkboxset";
import RadiosetControl from "./radioset";
import Dropdown from "./dropdown";
import SomeofselectControl from "./someofselect";
import OneofcolumnsControl from "./oneofcolumns";
import SomeofcolumnsControl from "./someofcolumns";
import SelectColumnsControl from "./selectcolumns";
import StructureTableControl from "./structuretable";
import StructurelisteditorControl from "./structurelisteditor";

import ControlItem from "./../components/control-item";
import Tooltip from "./../../tooltip/tooltip.jsx";
import { TOOL_TIP_DELAY } from "./../constants/constants.js";
import isEmpty from "lodash/isEmpty";
import uuid4 from "uuid/v4";

export default class ControlFactory {

	constructor(controller) {
		this.rightFlyout = true;
		this.controller = controller;
	}

	setFunctions(openFieldPicker, genUIItem) {
		this.genUIItem = genUIItem;
		this.openFieldPicker = openFieldPicker;
	}

	setRightFlyout(rightFlyout) {
		this.rightFlyout = rightFlyout;
	}

	_createElementId(propertyId) {
		let id = propertyId.name;
		if (propertyId.row) {
			id += "_" + propertyId.row;
			if (propertyId.col) {
				id += "_" + propertyId.col;
			}
		}
		return id;
	}


	/*
	* @param control
	* @param propertyId
	* @param tableInfo
	*/
	createControlItem(control, propertyId, tableInfo) {
		const stateStyle = {};
		let tooltipShow = true;
		const controlState = this.controller.getControlState(propertyId);
		if (controlState === STATES.HIDDEN) {
			stateStyle.display = "none";
			tooltipShow = false;
		} else if (controlState === STATES.DISABLED) {
			stateStyle.color = VALIDATION_MESSAGE.DISABLED;
			stateStyle.pointerEvents = "none";
			tooltipShow = false;
		}
		const that = this;
		function generateNumber() {
			const generator = control.label.numberGenerator;
			const min = generator.range && generator.range.min ? generator.range.min : 10000;
			const max = generator.range && generator.range.max ? generator.range.max : 99999;
			const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			that.controller.updatePropertyValue(propertyId, newValue);
		}

		let label = <span />;
		if (control.label && control.labelVisible !== false) {
			let description;
			let tooltip;
			if (control.description) {
				if (control.description.placement === "on_panel") {
					description = <div className="control-description" style={stateStyle}>{control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else if (tooltipShow) {
					tooltip = control.description.text; // default to tooltip
				}
			}
			let requiredIndicator;
			if (control.required) {
				requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
			}
			let numberGenerator;
			if (control.label.numberGenerator) {
				numberGenerator = (<label>{"\u00A0\u00A0"}<a className="number-generator" onClick={generateNumber} style={stateStyle}>
					{control.label.numberGenerator.label.default}
				</a></label>);
			}
			let hasFilter = false;
			if (control.subControls) {
				for (const subControl of control.subControls) {
					if (subControl.filterable) {
						hasFilter = true;
						break;
					}
				}
			}
			// structuretable labels w/o descriptions and filtering are created elsewhere
			const isStructureTable = control.controlType === ControlType.STRUCTURETABLE || control.controlType === ControlType.STRUCTURELISTEDITOR ||
				control.controlType === ControlType.SELECTCOLUMNS;
			if (!isStructureTable || description || hasFilter) {
				const tooltipId = uuid4() + "-tooltip_label_" + this._createElementId(propertyId);
				const tipContent = (
					<div className="properties-tooltips">
						{tooltip}
					</div>
				);
				label = (
					<div key={"label-" + control.name} className={"default-label-container"} style={stateStyle}>
						<div className = "properties-tooltips-container control-label-container">
							<Tooltip
								id={tooltipId}
								tip={tipContent}
								direction="right"
								delay={TOOL_TIP_DELAY}
								className="properties-tooltips"
								disable={isEmpty(tooltip) || !tooltipShow}
							>
								<div>
									<label className="control-label">{control.label.text}</label>
									{requiredIndicator}
									{numberGenerator}
									{description}
								</div>
							</Tooltip>
						</div>
					</div>);
			}
		}
		const controlObj = this.createControl(control, propertyId, tableInfo);
		return <ControlItem key={"ctrl-item-" + control.name} label={label} control={controlObj} />;
	}

	// Creates all controls that can be standalone or in tables
	createControl(control, propertyId, tableInfo) {
		if (!control || !propertyId) {
			return null;
		}
		// setup common properties used by all controls
		const controlRef = this._createElementId(propertyId);
		const controlKey = "ctrl-" + controlRef;
		const props = {};
		props.ref = controlRef;
		props.key = controlKey;
		props.control = control;
		props.controller = this.controller;
		props.propertyId = propertyId;
		if (tableInfo) {
			props.tableControl = tableInfo.table;
		}
		if (control.controlType === ControlType.TEXTFIELD) {
			return (<TextfieldControl {...props} />);
		} else if (control.controlType === ControlType.READONLY) {
			return (<ReadonlyControl {...props} />);
		} else if (control.controlType === ControlType.TEXTAREA) {
			return (<TextareaControl {...props} />);
		} else if (control.controlType === ControlType.EXPRESSION) {
			return (<ExpressionControl{...props} />);
		} else if (control.controlType === ControlType.TOGGLETEXT) {
			return (<ToggletextControl
				{...props}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
			/>);
		} else if (control.controlType === ControlType.PASSWORDFIELD) {
			return (<PasswordControl {...props} />);
		} else if (control.controlType === ControlType.NUMBERFIELD || control.controlType === ControlType.SPINNER) {
			return (<NumberfieldControl {...props} />);
		} else if (control.controlType === ControlType.DATEFIELD) {
			return (<DatefieldControl {...props} />);
		} else if (control.controlType === ControlType.TIMEFIELD) {
			return (<TimefieldControl {...props} />);
		} else if (control.controlType === ControlType.CHECKBOX) {
			return (<CheckboxControl {...props} />);
		} else if (control.controlType === ControlType.CHECKBOXSET && !tableInfo) {
			return (<CheckboxsetControl {...props} />);
		} else if (control.controlType === ControlType.RADIOSET) {
			return (<RadiosetControl {...props} />);
		} else if (control.controlType === ControlType.ONEOFSELECT || control.controlType === ControlType.SELECTSCHEMA) {
			return (<Dropdown
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
		} else if (control.controlType === ControlType.SELECTCOLUMN && !tableInfo) {
			return (<Dropdown
				{...props}
				rightFlyout={this.rightFlyout}
				fields={this.controller.getFilteredDatasetMetadata(propertyId)}
			/>);
		} else if (control.controlType === ControlType.SOMEOFSELECT && !tableInfo) {
			return (<SomeofselectControl {...props} />);
		} else if (control.controlType === ControlType.ONEOFCOLUMNS && !tableInfo) {
			return (<OneofcolumnsControl
				{...props}
				fields={this.controller.getFilteredDatasetMetadata(propertyId)}
			/>);
		} else if (control.controlType === ControlType.SOMEOFCOLUMNS && !tableInfo) {
			return (<SomeofcolumnsControl
				{...props}
				fields={this.controller.getFilteredDatasetMetadata(propertyId)}
			/>);
		} else if (control.controlType === ControlType.SELECTCOLUMNS && !tableInfo) {
			return (<SelectColumnsControl
				{...props}
				openFieldPicker={this.openFieldPicker}
				rightFlyout={this.rightFlyout}
			/>);
		} else if (control.controlType === ControlType.STRUCTURETABLE && !tableInfo) {
			return (<StructureTableControl
				{...props}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
				rightFlyout={this.rightFlyout}
			/>);
		} else if (control.controlType === ControlType.STRUCTURELISTEDITOR && !tableInfo) {
			return (<StructurelisteditorControl
				{...props}
				buildUIItem={this.genUIItem}
				rightFlyout={this.rightFlyout}
			/>);
		} else if (control.controlType === ControlType.CUSTOM) {
			return (
				<div key={controlKey}>
					{this.controller.getCustomControl(propertyId, control, tableInfo)}
				</div>
			);
		}
		return (<ReadonlyControl {...props} />);
	}

	/**
	* Used to create a control from a passed in paramDef.
	* Allows users to user a standard control in a custom control/panel
	* @param paramDef - see parameter-def schema
	* @param parameter - name of the parameter to pull from paramDef
	* @return control object (form schema) used to create standard react controls
	*/
	createFormControl(paramDef, parameter) {
		if (!paramDef) {
			return null;
		}
		const propDef = PropertyDef.makePropertyDef(null, paramDef.parameters, paramDef.complex_types, paramDef.uihints);
		if (propDef && propDef.parameterMetadata) {
			const l10nProvider = new L10nProvider(paramDef.resources);
			const prop = propDef.parameterMetadata.getParameter(parameter);
			let structureDef;
			if (prop.propType() === Type.STRUCTURE && propDef.structureMetadata) {
				structureDef = propDef.structureMetadata.getStructure(prop.baseType());
			}
			const control = makeControl(propDef.parameterMetadata, parameter, null, structureDef, l10nProvider);
			return control;
		}
		return null;
	}
}