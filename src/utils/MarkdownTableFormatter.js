class MarkdownTableFormatter {
  constructor(list) {
    this.list = list;
    this.headers = Object.keys(list[0]);
  }

  asMarkdownTable() {
    let table = this.generateHeader();
    table += this.generateSeparator();
    table += this.generateRows();
    return table;
  }

  generateHeader() {
    return `| ${this.headers.join(' | ')} |\n`;
  }

  generateSeparator() {
    return `| ${this.headers.map(() => '---').join(' | ')} |\n`;
  }

  generateRows() {
    let rows = '';
    for (const item of this.list) {
      const row = Object.values(item);
      rows += `| ${row.join(' | ')} |\n`;
    }
    return rows;
  }
}

module.exports = exports = MarkdownTableFormatter;