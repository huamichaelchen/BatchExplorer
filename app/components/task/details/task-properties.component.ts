import { Component, Input } from "@angular/core";

import { Job, JobAction, Task, TaskFailureAction } from "app/models";
import { TaskDecorator } from "app/models/decorators";

@Component({
    selector: "bex-task-properties",
    templateUrl: "./task-properties.html",
})
export class TaskPropertiesComponent {
    @Input()
    public job: Job;

    @Input()
    public set task(value: Task) {
        this._task = value;
        this.decorator = new TaskDecorator(value);
        this.constraints = this.decorator.constraints || {};
        this.executionInfo = this.decorator.executionInfo || {};
        this.nodeInfo = this.decorator.nodeInfo || {};
        this.processExitConditionData();
    }
    public get task() { return this._task; }

    public decorator: TaskDecorator;
    public constraints: any;
    public executionInfo: any;
    public exitConditionData: any;
    public nodeInfo: any;

    private _task: Task;

    public get exitConditionWarningMessage() {
        const disabled = this.job.onTaskFailure === TaskFailureAction.noaction;
        // tslint:disable-next-line
        const message = `To enable exit conditions you need to set onTaskFailure on the job to 'performexitoptionsjobaction'`;
        return disabled ? message : "";
    }

    public processExitConditionData() {
        let zeroNoAction = true;
        const noAction = [];
        const terminateJob = [];
        this._task.exitConditions.exitCodes.forEach((mapping) => {
            if (mapping.exitOptions.jobAction === JobAction.noaction) {
                noAction.push(mapping.code);
            } else {
                terminateJob.push(mapping.code);
                if (mapping.code === 0) {
                    zeroNoAction = false;
                }
            }
        });

        this._task.exitConditions.exitCodeRanges.forEach((mapping) => {
            if (mapping.exitOptions.jobAction === JobAction.noaction) {
                noAction.push(`${mapping.start} → ${mapping.end}`);
            } else {
                terminateJob.push(`${mapping.start} → ${mapping.end}`);
                if (mapping.start <= 0 && mapping.end >= 0) {
                    zeroNoAction = false;
                }
            }
        });

        terminateJob.push("All others");
        if (zeroNoAction) {
            noAction.unshift(0);
        }

        const schedulingError = this._task.exitConditions.schedulingError;
        const schedulingErrorNoAction = (schedulingError && schedulingError.jobAction) === JobAction.noaction;
        this.exitConditionData = {
            noAction,
            terminateJob,
            schedulingError: schedulingErrorNoAction ? "No Action" : "Terminate Job",
        };
    }
}
