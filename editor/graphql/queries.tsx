import { gql } from "@apollo/client";

export const GET_COLORS = gql`
	query color {
		color {
			red
		}
	}
`;
