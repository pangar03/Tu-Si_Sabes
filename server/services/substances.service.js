const path = require('path');
const fs = require('fs');

const adulterantPath = path.join(__dirname, "../../data/adulterants.data.json");
const adulterantData = JSON.parse(fs.readFileSync(adulterantPath, "utf-8"));

const substancePath = path.join(__dirname, "../../data/substances.data.json");
const substanceData = JSON.parse(fs.readFileSync(substancePath, "utf-8"));

function getAllAdulterants() {
    return {code: 200, message: "Adulterantes obtenidos exitosamente", adulterants: adulterantData};
};

function getAllSubstances() {
    return {code: 200, message: "Sustancias obtenidas exitosamente", substances: substanceData};
};

function getSubstanceById(id) {
    const substance = substanceData.find((substance) => substance.id === id);
    if (!substance) {
        return { code: 404, message: "No se ha encontrado la sustancia" };
    } else {
        return { code: 200, substance, message: "La sustancia se encontró exitosamente" };
    }
};

function getAdulterantById(id) {
    const adulterant = adulterantData.find((adulterant) => adulterant.id === id);
    if (!adulterant) {
        return { code: 404, message: "No se ha encontrado el adulterante" };
    } else {
        return { code: 200, adulterant, message: "El adulterante se encontró exitosamente" };
    }
};

module.exports = {
    getAllAdulterants,
    getAllSubstances,
    getSubstanceById,
    getAdulterantById,
};