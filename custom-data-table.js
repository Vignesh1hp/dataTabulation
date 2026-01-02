import { CommonDialogComponent } from "@/app/components/common-dialog/common-dialog.component";
import { CustomDropdownComponent } from "@/app/components/custom-dropdown/custom-dropdown.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragExit,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputSwitchModule } from "primeng/inputswitch";
import { CustomTableViewComponent } from "../custom-table-view/custom-table-view.component";
import { CustomCheckboxComponent } from "@/app/components/custom-checkbox/custom-checkbox.component";
import { RadioButtonModule } from "primeng/radiobutton";
import { DataTabulationQuestion } from "@/app/interfaces/data-tabulation-question";
import questionData from "@/mock-data/response.json";
export interface Question {
  id: string;
  question: string;
  answers: {
    key: string;
    label: string;
    count: number;
  }[];
}

export interface ColumnTable {
  type: "column";
  qid: string;
  questionText: string;
  headers: string[];
  values: string[];
}

export interface RowTable {
  type: "row";
  qid: string;
  questionText: string;
  rows: { answer: string; count: string }[];
}

export interface ColumnQuestion {
  id: string;
  questionText: string;
  answers: {
    key: string;
    label: string;
    count: number;
    percentage?: number; //percentage
  }[];
  showColorPicker?: boolean;
  labelBgColor?: string;
  labelTextColor?: string;
}

export interface RowQuestion {
  id: string;
  questionText: string;
  answers: {
    key: string;
    label: string;
    count: number;
    percentage?: number; //percentage
  }[];

  labelBgColor?: string;
  labelTextColor?: string;
}

export interface Cell {
  value: number;
  percentage?: number;
}

export type GeneratedTable = ColumnTable | RowTable | null;

export interface SavedTable {
  columnQuestions: ColumnQuestion[];
  rowQuestions: RowQuestion[];
  tableMatrix: Cell[][];
}

@Component({
  selector: "app-custom-data-table",
  imports: [
    CommonDialogComponent,
    CdkDrag,
    CdkDropList,
    CustomDropdownComponent,
    FormsModule,
    InputSwitchModule,
    CommonModule,
    CustomTableViewComponent,
    CustomCheckboxComponent,
    RadioButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./custom-data-table.component.html",
  styleUrl: "./custom-data-table.component.scss",
})
export class CustomDataTableComponent {
  @Output() close = new EventEmitter<void>();
  @Input() visible: boolean = false;
  selectedQuestionId: string | null = null;
  generatedTable: GeneratedTable = null; // holds the generated table data
  rowDropList: Question[] = [];
  columnDropList: Question[] = [];
  rowActive = false;
  columnActive = false;
  selectedPosition: string = "";
  isHideEnabled = true;
  showQuestions = false; // default: show only q.id
  selectedQuestions = new Set<string>();
  mode: "normal" | "compact" = "normal";
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
  showSearch: boolean = true;
  @ViewChild("rightSection", { static: false })
  rightSection!: ElementRef;
  isTotalModalVisible = false;
  isSummaryModalVisible = false;
  applyTo: "above" | "below" | null = null;
  columnQuestions: ColumnQuestion[] = [];
  rowQuestions: RowQuestion[] = [];
  tableMatrix: Cell[][] = [];
  @Output() tableGenerated = new EventEmitter<SavedTable>();
  dataTabulationQuestion: DataTabulationQuestion[] = [];
  @Input() savedTable?: SavedTable;
  showleftSection = true;
  blockPreview = (drag: CdkDrag, drop: CdkDropList) => {
    return drag.dropContainer?.id === "questionList";
  };
  toggleleftSection() {
    this.showleftSection = !this.showleftSection;
  }

  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
  }

  onClose() {
    this.close.emit();
  }

  openTotalModal() {
    this.isTotalModalVisible = true;
  }

  closeTotalModal() {
    this.isTotalModalVisible = false;
  }

  openSummaryModal() {
    this.isSummaryModalVisible = true;
  }

  closeSummaryModal() {
    this.isSummaryModalVisible = false;
  }

  confirmAndSave() {
    const payload: SavedTable = {
      columnQuestions: this.columnQuestions,
      rowQuestions: this.rowQuestions,
      tableMatrix: this.tableMatrix,
    };

    this.tableGenerated.emit(payload);
    this.close.emit(); // then close the modal
  }

  // question to mutate or use in our table
  questions: Question[] | undefined = [];

  positions = [
    { label: "Row", value: "row" },
    { label: "Column", value: "column" },
  ];

  ngOnInit(): void {
    this.dataTabulationQuestion = questionData.questions;

    this.questions = this.dataTabulationQuestion
      .map((q) => {
        const qVar = q.question?.var;
        const qTxt = q.question?.txt;

        if (!qVar || !qTxt) return null; // skip if id or text missing

        const answers = Object.keys(q.options ?? {})
          .filter((key) => q.options![key] !== undefined)
          .map((key) => ({
            key,
            label: q.options![key]!, // safe after filter
            count: q.stats?.count?.[key] ?? 0,
            percentage: q.stats?.percentage?.[key],
          }))
          .filter((a) => a.label && a.count !== undefined && a.count !== null);

        if (answers.length === 0) return null; // skip if no valid answers

        return {
          id: qVar,
          question: qTxt,
          answers,
        } as Question; // type assertion ensures TS knows this is valid
      })
      .filter((q): q is Question => q !== null); // filter out nulls, TS now knows it's Question[]
  }
  get dragPreviewText(): string {
    console.log(this.selectedQuestions.size);
    if (this.selectedQuestions.size > 1) {
      console.log(this.selectedQuestions.size);
      return Array.from(this.selectedQuestions).join(",");
    }
    return this.selectedQuestionId ?? "";
  }
  get concatenatedSelectedIds(): string {
    return Array.from(this.selectedQuestions).join(",");
  }
  selectQuestion(id: string) {
    this.selectedQuestionId = id;
  }

  get selectedAnswers(): string[] {
    const q = this.questions?.find((x) => x.id === this.selectedQuestionId);
    return q ? q.answers.map((a) => "sdfsdfsdf") : [];
  }

  onDrop(event: CdkDragDrop<any>, dropType: "row" | "column") {
    /* ------------------------------------
     * 1️⃣ REORDER inside item lists
     * ---------------------------------- */
    if (
      event.previousContainer === event.container &&
      (event.container.id === "columnItems" ||
        event.container.id === "rowItems")
    ) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.generateMatrix();
      return;
    }

    /* ------------------------------------
     * 2️⃣ BLOCK dropping ON headers
     * ---------------------------------- */
    if (
      event.previousContainer === event.container &&
      (event.container.id === "columnHeader" ||
        event.container.id === "rowHeader")
    ) {
      return;
    }

    /* ------------------------------------
     * 3️⃣ MOVE between row ↔ column
     * ---------------------------------- */
    if (
      event.previousContainer.id === "rowItems" ||
      event.previousContainer.id === "columnItems"
    ) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.rowActive = false;
      this.columnActive = false;
      this.generateMatrix();
      return;
    }

    /* ------------------------------------
     * 4️⃣ ADD from questionList
     * ---------------------------------- */
    let draggedQuestions: Question[] = [];

    if (this.selectedQuestions.size > 0) {
      draggedQuestions =
        this.questions?.filter((q) => this.selectedQuestions.has(q.id)) ?? [];
    } else if (event.item.data) {
      draggedQuestions = [event.item.data];
    }

    if (!draggedQuestions.length) return;

    draggedQuestions.forEach((q) => {
      if (dropType === "column") {
        if (!this.columnQuestions.some((c) => c.id === q.id)) {
          this.columnQuestions.push({
            id: q.id,
            questionText: q.question,
            answers: q.answers,
          });
        }
        this.columnActive = false;
      } else {
        if (!this.rowQuestions.some((r) => r.id === q.id)) {
          this.rowQuestions.push({
            id: q.id,
            questionText: q.question,
            answers: q.answers,
          });
        }
        this.rowActive = false;
      }
    });

    this.selectedQuestions.clear();
    this.generateMatrix();
  }
  onDeleteDrop(event: CdkDragDrop<any>) {
    const prevId = event.previousContainer.id;

    if (prevId === "rowItems") {
      this.rowQuestions.splice(event.previousIndex, 1);
    }

    if (prevId === "columnItems") {
      this.columnQuestions.splice(event.previousIndex, 1);
    }

    this.generateMatrix();
  }

  generateMatrix(): void {
    if (!this.hasValidQuestions()) {
      this.tableMatrix = [];
      return;
    }

    if (this.isSameQuestionCase()) {
      this.buildDiagonalMatrix();
    } else {
      this.buildMeanMatrix();
    }
  }

  private hasValidQuestions(): boolean {
    return this.rowQuestions.length > 0 && this.columnQuestions.length > 0;
  }

  private isSameQuestionCase(): boolean {
    return (
      this.rowQuestions.length === 1 &&
      this.columnQuestions.length === 1 &&
      this.rowQuestions[0].id === this.columnQuestions[0].id
    );
  }

  private buildDiagonalMatrix(): void {
    const rowAnswers = this.rowQuestions[0].answers;
    const colAnswers = this.columnQuestions[0].answers;

    this.tableMatrix = rowAnswers.map((rowAns) =>
      colAnswers.map((colAns) => ({
        value: rowAns.key === colAns.key ? rowAns.count : 0,
        percentage: rowAns.key === colAns.key ? rowAns.percentage : undefined,
      }))
    );
  }

  private buildMeanMatrix(): void {
    const rowAnswers = this.rowQuestions.flatMap((q) => q.answers);
    const colAnswers = this.columnQuestions.flatMap((q) => q.answers);

    this.tableMatrix = rowAnswers.map((rowAns) =>
      colAnswers.map((colAns) => {
        const rowCount = rowAns.count ?? 0;
        const colCount = colAns.count ?? 0;
        const mean = Math.round((rowCount + colCount) / 2);

        return { value: mean };
      })
    );
  }

  onDropListEnter(event: CdkDragEnter<any>) {
    if (event.container.id === "columnHeader") {
      this.columnActive = true;
    }

    if (event.container.id === "rowHeader") {
      this.rowActive = true;
    }
  }

  onDropListExit(event: CdkDragExit<any>) {
    if (event.container.id === "columnHeader") {
      this.columnActive = false;
    }

    if (event.container.id === "rowHeader") {
      this.rowActive = false;
    }
  }
  toggleVisibility() {
    console.log("");
  }

  setMode(m: "normal" | "compact") {
    this.mode = m;
  }

  // Table reset
  resetTable() {
    this.columnQuestions = [];
    this.rowQuestions = [];
    this.tableMatrix = [];
  }

  selectMultipleQuestions(id: string, event: MouseEvent) {
    // Toggle selection on every click (mouse or ctrl)
    if (this.selectedQuestions.has(id)) {
      this.selectedQuestions.delete(id);
    } else {
      this.selectedQuestions.add(id);
    }

    // keep last clicked question for Answers panel
    this.selectedQuestionId = id;
  }
  onDragEnded(event: any, source: "row" | "column", index: number) {
    const dragPoint = event.dropPoint;
    const rect = this.rightSection.nativeElement.getBoundingClientRect();
    // 🔴 IMPORTANT: reset all active states immediately
    this.rowActive = false;
    this.columnActive = false;
    const isOutside =
      dragPoint.x < rect.left ||
      dragPoint.x > rect.right ||
      dragPoint.y < rect.top ||
      dragPoint.y > rect.bottom;

    if (isOutside) {
      if (source === "row") {
        console.log("row");
        this.rowQuestions.splice(index, 1);
      } else {
        console.log("column");

        this.columnQuestions.splice(index, 1);
      }
      this.generateMatrix();
    }
  }
}
