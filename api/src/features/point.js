const xss = require("xss");

const database = require('../db/database.js');

class Point {
  constructor() {
    this.created = false;
  }

  read_from_pid(pid) {
    const data = database.db.prepare(
      'SELECT * FROM point WHERE pid = ?'
    ).get(pid);

    if(data) {
      this.pointdescription = data.pointdescription;

      this.lati = data.lati;
      this.long = data.long;

      this.time_open = data.time_open;
      this.time_close = data.time_close;

      this.accepts_paper = data.accepts_paper;
      this.accepts_metal = data.accepts_metal;
      this.accepts_organic = data.accepts_organic;
      this.accepts_biological = data.accepts_biological;

      this.approved = data.approved;
      this.creator = data.creator;

      this.created = true;

      this.pid = pid;

      return true;
    }

    return false;
  }

  __new_or_update(isnew=false, pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator) {
    if(isnew) {
      database.db.prepare(`
        INSERT INTO point (pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator);
    } else {
      database.db.prepare(`
        UPDATE point
        SET pointdescription = ?, lati = ?, long = ?, time_open = ?, time_close = ?, accepts_paper = ?, accepts_metal = ?, accepts_organic = ?, accepts_biological = ?, approved = ?, creator = ?
        WHERE pid = ?
      `).run(pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator, this.pid);
    }

    this.pointdescription = pointdescription;

    this.lati = lati;
    this.long = long;

    this.time_open = time_open;
    this.time_close = time_close;

    this.accepts_paper = accepts_paper;
    this.accepts_metal = accepts_metal;
    this.accepts_organic = accepts_organic;
    this.accepts_biological = accepts_biological;

    this.approved = approved;
    this.creator = creator;

    this.created = true;
  }

  new(pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator) {
    this.__new_or_update(true, pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator);
  }

  update(pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological) {
    if(this.created) {
      this.__new_or_update(false, pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, 1, this.creator);
      
      return true;
    }

    return false;
  }

  log_access(uid) {
    if(this.created) {
      let now = new Date();
      let this_hour = now.toLocaleString('pt-BR').substring(12).substring(0,5);

      database.db.prepare(`
        INSERT INTO access (hour_accessed, uid, pid)
        VALUES(?, ?, ?)
      `).run(this_hour, uid, this.pid);

      return true;
    }

    return false;
  }

  times_accessed() {
    if(this.created) {
      let amt = database.db.prepare(
        `
          SELECT COUNT(*) from access
          WHERE pid = ?;
        `
      ).get(this.pid)["COUNT(*)"];

      return amt;
    }
    
    return false;
  }

  approve() {
    if(this.created) {
      database.db.prepare(
        `
        UPDATE point
        SET approved = ?
        WHERE pid = ?;
        `
      ).run(1, this.pid);
      
      return true;
    }

    return false;
  }

  get_accesses(n) {
    if(this.created) {
      if(n < 1) n = 1;
      if(n > 1000) n = 1000;

      let ret = database.db.prepare(
        `
          SELECT * from access
          WHERE pid = ?
          ORDER BY aid DESC
          LIMIT ?;
        `
      ).all(this.pid, n);

      return ret;
    }

    return false;
  }

  create_report(description, problem_kind, uid) {
    if(this.created) {
        let category_noexist = 0;
        let category_badtime = 0;
        let category_full = 0;

        if(problem_kind == "pointabsent") {
            category_noexist = 1;
        } else if(problem_kind == "pointfull") {
            category_full = 1; 
        } else if(problem_kind == "pointtime") {
            category_badtime = 1;
        }
        
        database.db.prepare(`
            INSERT INTO report (reportdescription, category_noexist, category_full, category_badtime, uid, pid)
            VALUES(?, ?, ?, ?, ?, ?)
        `).run(xss.filterXSS(description), category_noexist, category_full, category_badtime, uid, this.pid);

        return true;
    }

    return false;
  }

  get_reports() {
    if(this.created) {
        return database.db.prepare(`
            SELECT * FROM report
            WHERE pid = ?;
        `).all(this.pid);
    }

    return false;
  }

  delete() {
    if(this.created) {
      database.db.prepare(
        "DELETE FROM point WHERE pid = ?;"
      ).run(this.pid);

      this.created = false;

      return true;
    }

    return false;
  }
}

module.exports = {
    Point
}