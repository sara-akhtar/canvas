/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-invalid-this: "off" */
/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";

export default class PipelineInHandler {

	// Returns the 'canvas info', stored internally in the object model, by extracting
	// that info from the pipeline provided. 'Canvas info' consists of three
	// arrays: nodes, comments and links.
	static convertPipelineToCanvasInfo(pipeline) {
		const nodes = has(pipeline, "nodes") ? pipeline.nodes : [];
		const comments = has(pipeline, "app_data.ui_data.comments") ? pipeline.app_data.ui_data.comments : [];

		var canvas = {
			"sub_id": pipeline.id,
			"nodes": this.convertNodes(nodes),
			"comments": this.convertComments(comments),
			"links": this.convertLinks(nodes, comments),
		};

		return canvas;
	}

	static convertNodes(nodes) {
		return nodes.map((node) =>
			({
				"id": node.id,
				"type": node.type,
				"operator_id_ref": node.op,
				"output_ports": this.convertOutputs(node),
				"input_ports": this.convertInputs(node),
				"label": this.getLabel(node),
				"description": has(node, "app_data.ui_data.description") ? node.app_data.ui_data.description : "",
				"image": has(node, "app_data.ui_data.image") ? node.app_data.ui_data.image : "",
				"x_pos": has(node, "app_data.ui_data.x_pos") ? node.app_data.ui_data.x_pos : 10,
				"y_pos": has(node, "app_data.ui_data.y_pos") ? node.app_data.ui_data.y_pos : 10,
				"class_name": has(node, "app_data.ui_data.class_name") ? node.app_data.ui_data.class_name : "",
				"decorations": this.convertDecorations(node.app_data.ui_data.decorations),
				"parameters": has(node, "parameters") ? node.parameters : [],
				"messages": has(node, "app_data.ui_data.messages") ? node.app_data.ui_data.messages : [],
			})
		);
	}

	static getLabel(obj) {
		// node label in pipeline-flow-ui schema is not a resource_def anymore, but just a string
		const label = has(obj, "app_data.ui_data.label") ? obj.app_data.ui_data.label : "";
		if (isObject(label) && label.default) {
			return label.default;
		}
		return label;
	}

	static convertOutputs(node) {
		let outputs;
		if (node.output) {
			outputs = [node.output];
		} else if (node.outputs) {
			outputs = node.outputs;
		} else {
			outputs = [];
		}
		return outputs.map((output) => this.getPortObject(output));
	}

	static convertInputs(node) {
		let inputs;
		if (node.input) {
			inputs = [node.input];
		} else if (node.inputs) {
			inputs = node.inputs;
		} else {
			inputs = [];
		}
		return inputs.map((input) => this.getPortObject(input));
	}

	static getPortObject(port) {
		const portObj = {
			"id": port.id,
			"label": this.getLabel(port)
		};
		if (has(port, "app_data.ui_data.cardinality")) {
			portObj.cardinality = {
				"min": port.app_data.ui_data.cardinality.min,
				"max": port.app_data.ui_data.cardinality.max
			};
		}
		if (has(port, "app_data.ui_data.class_name")) {
			portObj.class_name = port.app_data.ui_data.class_name;
		}
		return portObj;
	}

	static convertDecorations(decorations) {
		var newDecorations = [];
		if (decorations) {
			decorations.forEach((decoration) => {
				var newDecoration = {
					position: decoration.position,
					class_name: decoration.class_name,
					hotspot: decoration.hotspot,
					id: decoration.id,
					image: decoration.image
				};
				newDecorations.push(newDecoration);
			});
		}
		return newDecorations;
	}

	static convertComments(comments) {
		return comments.map((comment) =>
			({
				"id": comment.id,
				"content": comment.content,
				"height": comment.height,
				"width": comment.width,
				"x_pos": comment.x_pos,
				"y_pos": comment.y_pos,
				"class_name":
					has(comment, "class_name")
						? comment.class_name : "d3-comment-rect",
			})
		);
	}

	static convertLinks(nodes, comments) {
		const links = [];
		let id = 1;

		nodes.forEach((node) => {
			// Regular nodes have a inputs (plural) field containing links (plural)
			if (node.inputs) {
				node.inputs.forEach((input) => {
					if (input.links) {
						input.links.forEach((link) => {
							if (this.isNode(nodes, link.node_id_ref)) {
								const newLink = {
									"id": "canvas_link_" + id++,
									"class_name":
										has(link, "app_data.ui_data.class_name")
											? link.app_data.ui_data.class_name : "d3-data-link",
									"srcNodeId": link.node_id_ref,
									"trgNodeId": node.id,
									"trgNodePortId": input.id,
									"type": "nodeLink"
								};
								if (link.port_id_ref) { // according to the spec, port_id_ref is optional for links
									newLink.srcNodePortId = link.port_id_ref;
								}
								links.push(newLink);
							}
						});
					}
				});
			}
			// Binding nodes have a input (singular) field containing a link (singular)
			if (node.input) {
				if (node.input.link) {
					if (this.isNode(nodes, node.input.link.node_id_ref)) {
						const newLink = {
							"id": "canvas_link_" + id++,
							"class_name":
								has(node, "input.link.app_data.ui_data.class_name")
									? node.input.link.app_data.ui_data.class_name : "d3-data-link",
							"srcNodeId": node.input.link.node_id_ref,
							"trgNodeId": node.id,
							"trgNodePortId": node.input.id,
							"type": "nodeLink"
						};
						if (node.input.link.port_id_ref) {
							newLink.srcNodePortId = node.input.link.port_id_ref;
						}
						links.push(newLink);
					}
				}
			}

			// association links are defined in UI data
			if (has(node, "app_data.ui_data.associations") && !isEmpty(node.app_data.ui_data.associations)) {
				node.app_data.ui_data.associations.forEach((association) => {
					if (this.isNode(nodes, association.node_ref)) {
						const newLink = {
							"id": "canvas_link_" + id++,
							"class_name": association.class_name ? association.class_name : "d3-object-link",
							"srcNodeId": node.id,
							"trgNodeId": association.node_ref,
							"type": "associationLink"
						};

						links.push(newLink);
					}
				});
			}
		});

		comments.forEach((comment) => {
			if (comment.associated_id_refs) {
				comment.associated_id_refs.forEach((assocRef) => {
					if (this.isNode(nodes, assocRef.node_ref)) {
						const newLink = {
							"id": "canvas_link_" + id++,
							"class_name":
								has(assocRef, "class_name")
									? assocRef.class_name : "d3-comment-link",
							"srcNodeId": comment.id,
							"trgNodeId": assocRef.node_ref,
							"type": "commentLink"
						};
						links.push(newLink);
					}
				});
			}
		});

		return links;
	}

	static isNode(nodes, id) {
		const index = nodes.findIndex((node) => node.id === id);
		if (index === -1) {
			return false;
		}
		return true;
	}
}