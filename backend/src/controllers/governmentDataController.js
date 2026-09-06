const db = require('../database/db');

function getRiversAndDams(req, res) {
  try {
    const { type, basin, state } = req.query;
    let query = 'SELECT * FROM rivers_and_dams WHERE 1=1';
    const params = [];

    if (type && type !== 'All') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (basin && basin !== 'All') {
      query += ' AND river_basin LIKE ?';
      params.push(`%${basin}%`);
    }
    if (state && state !== 'All') {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }

    query += " ORDER BY CASE WHEN downstream_hazard_level = 'Critical' THEN 0 ELSE 1 END, live_storage_capacity_mcm DESC";
    const data = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('[Govt Data - Rivers/Dams Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rivers and dams registry' });
  }
}

function getMiningSites(req, res) {
  try {
    const { operator_type, mineral, state } = req.query;
    let query = 'SELECT * FROM mining_sites WHERE 1=1';
    const params = [];

    if (operator_type && operator_type !== 'All') {
      query += ' AND operator_type = ?';
      params.push(operator_type);
    }
    if (mineral && mineral !== 'All') {
      query += ' AND mineral_type LIKE ?';
      params.push(`%${mineral}%`);
    }
    if (state && state !== 'All') {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }

    query += " ORDER BY CASE WHEN ground_subsidence_risk = 'Critical' THEN 0 ELSE 1 END, production_capacity_mtpa DESC";
    const data = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('[Govt Data - Mining Sites Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch mining registry' });
  }
}

function getDisasters20Yr(req, res) {
  try {
    const { year, category, state_country } = req.query;
    let query = 'SELECT * FROM historical_disasters_20yr WHERE 1=1';
    const params = [];

    if (year && year !== 'All') {
      query += ' AND year = ?';
      params.push(Number(year));
    }
    if (category && category !== 'All') {
      query += ' AND disaster_category LIKE ?';
      params.push(`%${category}%`);
    }
    if (state_country && state_country !== 'All') {
      query += ' AND state_country LIKE ?';
      params.push(`%${state_country}%`);
    }

    query += ' ORDER BY year DESC, casualties_count DESC';
    const data = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('[Govt Data - 20Yr Disasters Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch 20-year disaster archive' });
  }
}

function getGeologySoils(req, res) {
  try {
    const { state, soil_type } = req.query;
    let query = 'SELECT * FROM geological_soil_rock WHERE 1=1';
    const params = [];

    if (state && state !== 'All') {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }
    if (soil_type && soil_type !== 'All') {
      query += ' AND soil_major_type LIKE ?';
      params.push(`%${soil_type}%`);
    }

    query += ' ORDER BY slope_stability_index ASC';
    const data = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('[Govt Data - Geology Soils Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch geological soil taxonomy' });
  }
}

module.exports = {
  getRiversAndDams,
  getMiningSites,
  getDisasters20Yr,
  getGeologySoils
};
