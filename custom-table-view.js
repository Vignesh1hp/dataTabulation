import { Component, Input } from "@angular/core";
import {
  Cell,
  ColumnQuestion,
  RowQuestion,
} from "../custom-data-table/custom-data-table.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-custom-table-view",
  imports: [CommonModule, FormsModule],
  templateUrl: "./custom-table-view.component.html",
  styleUrl: "./custom-table-view.component.scss",
})
export class CustomTableViewComponent {
  @Input() columnQuestions: ColumnQuestion[] = [];
  @Input() rowQuestions: RowQuestion[] = [];
  @Input() tableMatrix: Cell[][] = [];

  getGlobalRowIndex(rowQ: RowQuestion, answerIndex: number): number {
    let index = 0;

    for (const q of this.rowQuestions) {
      if (q.id === rowQ.id) break;
      index += q.answers.length;
    }

    return index + answerIndex;
  }

  toggleColorPicker(colQ: ColumnQuestion): void {
    colQ.showColorPicker = !colQ.showColorPicker;
  }

  openColumnColorPicker(input: HTMLInputElement): void {
    input.click(); // opens native color picker
    
  }

  // color picker for column and row
  setColumnLabelColor(colQ: ColumnQuestion, event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    colQ.labelBgColor = color;
    colQ.labelTextColor = this.getContrastTextColor(color); // ✅ FIX

    console.log(this.columnQuestions,"Hello");
    
  }

  openRowColorPicker(input: HTMLInputElement): void {
    input.click();
  }

  setRowLabelColor(rowQ: RowQuestion, event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    rowQ.labelBgColor = color;
    rowQ.labelTextColor = this.getContrastTextColor(color);
  }

  getContrastTextColor(bgColor: string): string {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000" : "#fff";
  }
}
