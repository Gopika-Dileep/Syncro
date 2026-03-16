import { Request, Response } from "express";
import { ITeamService } from "../../interfaces/services/ITeamService";


export class TeamController{
    constructor(private _teamService:ITeamService) {}

    createTeam = async (req:Request ,res:Response) =>{
        try{
            const {name} = req.body;
            const userId = req.userId;

            if(!userId){
                res.status(401).json({success:false,message:'unauthorized'});
                return ;
            }

            const team = await this._teamService.createTeam(userId,name);
            res.status(201).json({success:true,data:team});
        }catch(error:unknown){
            const message = error instanceof Error? error.message:"internal server error";
            res.status(400).json({success:false,message});
        }
    }

    getTeams = async (req:Request , res:Response) =>{
        try{
            const companyId = req.userId;
            if(!companyId) throw new Error("unauthoried");

            const teams = await this._teamService.getTeams(companyId);
            res.status(200).json({success:true,data:teams});
        }catch(err:unknown){
            const message = err instanceof Error? err.message:"internal server error";
            res.status(400).json({success:false,message})
        }
    }
}