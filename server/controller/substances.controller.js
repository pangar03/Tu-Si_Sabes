const { getSubstanceById, getAdulterantById, getAllAdulterants, getAllSubstances } = require("../services/substances.service");

const getSubstancesController = (req, res) => {
    const id = req.query.id;

    if(id){
        const substance = getSubstanceById(id);
        if(substance.code !== 200) {
            return res.send(substance);
        } else {
            return res.send(substance);
        }
    } else {
        const substances = getAllSubstances();
        return res.send(substances);
    }
};

const getAdulterantsController = (req, res) => {
    const id = req.query.id;

    if(id){
        const adulterant = getAdulterantById(id);
        if(adulterant.code !== 200) {
            return res.send(adulterant);
        } else {
            return res.send(adulterant);
        }
    } else {
        const adulterants = getAllAdulterants();
        return res.send(adulterants);
    }
};

module.exports = {
    getSubstancesController,
    getAdulterantsController,
};