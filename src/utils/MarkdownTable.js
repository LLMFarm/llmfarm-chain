class MarkdownTable {
  constructor(list, headers, showIndex = false) {
    this.list = list;
    this.headers = headers;
    this.showIndex = showIndex;
  }

  asMarkdownTable() {
    let table = this.generateHeader();
    table += this.generateSeparator();
    table += this.formatRows();
    return table;
  }

  generateHeader() {
    return `| ${this.headers.join(' | ')} |\n`;
  }

  generateSeparator() {
    return `| ${this.headers.map(() => '---').join(' | ')} |\n`;
  }

  formatRows() {
    const rows = []
    let index = 1;
    for (const item of this.list) {
      const row = Object.values(item);
      if (this.showIndex) {
        row.unshift(index++);
      }
      rows.push(`| ${row.join(' | ')} |`)
    }
    return rows.join('\n');
  }
}

module.exports = exports = MarkdownTable;